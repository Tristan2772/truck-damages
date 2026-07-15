import { GetObjectCommand } from "@aws-sdk/client-s3";

import { insertTruckReportImage } from "~/lib/db/queries/images";
import { InsertTruckReportImage } from "~/lib/db/schema";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

type ObjectMetadata = {
  "truck-report-id": string;
  "user-id": string;
};

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertTruckReportImage.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const vin = getRouterParam(event, "vin") as string;
  const id = getRouterParam(event, "id") as string;

  await event.$fetch(`/api/trucks/${vin}/${id}`);

  const client = createS3Client();
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: result.data.key,
  });

  const response = await client.send(command);
  const metadata = response.Metadata as ObjectMetadata | undefined;

  if (!metadata
    || metadata["truck-report-id"] !== id
    || metadata["user-id"] !== event.context.user.id.toString()) {
    return createError({
      statusCode: 404,
      statusMessage: "Image not found",
    });
  }

  const inserted = await insertTruckReportImage(Number(id), result.data, event.context.user.id);
  return inserted;
});
