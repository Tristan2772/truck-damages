import z from "zod";

import { findTruckReportImageKeysByReportId } from "~/lib/db/queries/images";
import { removeReportById } from "~/lib/db/queries/reports";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import deleteS3Objects from "~/utils/delete-s3-objects";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as string;
  const vin = getRouterParam(event, "vin") as string;

  if (!z.coerce.number().safeParse(id).success) {
    return createError({
      statusCode: 422,
      statusMessage: "Invalid Id.",
    });
  }

  await event.$fetch(`/api/trucks/${vin}/${id}`);

  const imageKeys = await findTruckReportImageKeysByReportId(Number(id), event.context.user.id);

  if (imageKeys.length) {
    try {
      const client = createS3Client();
      await deleteS3Objects(client, env.S3_BUCKET, imageKeys);
    }
    catch {
      return createError({
        statusCode: 502,
        statusMessage: "Failed to delete report images from storage.",
      });
    }
  }

  const deleted = await removeReportById(Number(id), event.context.user.id);

  if (!deleted) {
    return createError({
      statusCode: 404,
      statusMessage: "Report not found",
    });
  }

  setResponseStatus(event, 204);
});
