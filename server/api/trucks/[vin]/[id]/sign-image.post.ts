import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { z } from "zod";

import { findReport } from "~/lib/db/queries/reports";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";
import sendZodError from "~/utils/send-zod-error";

const MAX_CONTENT_LENGTH = 1024 * 1024 * 0.5;

const ImageSchema = z.object({
  contentLength: z.number().min(1).max(MAX_CONTENT_LENGTH),
  checksum: z.string(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const isManager = isManagerUser(event.context.user);
  const requestUserId = Number(event.context.user.id);
  const result = await readValidatedBody(event, ImageSchema.safeParse);

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

  const fileName = crypto.randomUUID();
  const key = `${requestUserId}/${id}/${fileName}.jpg`;

  const { url, fields } = await createPresignedPost(client, {
    Bucket: env.S3_BUCKET,
    Key: key,
    Expires: 120,
    Fields: {
      "x-amz-checksum-sha256": result.data.checksum,
    },
    Conditions: [
      ["content-length-range", result.data.contentLength, result.data.contentLength],
      ["eq", "$x-amz-meta-user-id", requestUserId.toString()],
      ["eq", "$x-amz-meta-truck-report-id", id],
    ],

  });

  fields["x-amz-meta-user-id"] = requestUserId.toString();
  fields["x-amz-meta-truck-report-id"] = id;

  return {
    url,
    fields,
    key,
  };
});
