import { GetObjectCommand } from "@aws-sdk/client-s3";
import z from "zod";

import { insertTruckReportImage } from "~/lib/db/queries/images";
import { findReport } from "~/lib/db/queries/reports";
import { InsertTruckReportImage } from "~/lib/db/schema";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";
import sendZodError from "~/utils/send-zod-error";

type ObjectMetadata = {
  "truck-report-id": string;
  "user-id": string;
};

export default defineAuthenticatedEventHandler(async (event) => {
  const isManager = isManagerUser(event.context.user);
  const requestUserId = Number(event.context.user.id);
  const result = await readValidatedBody(event, InsertTruckReportImage.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const vin = getRouterParam(event, "vin") as string;
  const id = getRouterParam(event, "id") as string;

  if (!z.coerce.number().safeParse(id).success) {
    return createError({
      statusCode: 422,
      statusMessage: "Invalid Id.",
    });
  }

  await event.$fetch(`/api/trucks/${vin}/${id}`);

  const report = await findReport(Number(id));

  if (!report) {
    return createError({
      statusCode: 404,
      statusMessage: "Report not found.",
    });
  }

  if (!isManager && report.userId !== requestUserId) {
    return createError({
      statusCode: 403,
      statusMessage: "Only managers and report owners can add or edit report images.",
    });
  }

  const client = createS3Client();
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: result.data.key,
  });

  const response = await client.send(command);
  const metadata = response.Metadata as ObjectMetadata | undefined;

  if (!metadata
    || metadata["truck-report-id"] !== id
    || metadata["user-id"] !== requestUserId.toString()) {
    return createError({
      statusCode: 404,
      statusMessage: "Image not found",
    });
  }

  const inserted = await insertTruckReportImage(Number(id), result.data, requestUserId);
  return inserted;
});
