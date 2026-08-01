import { findTruckReportImageKeysByTruckVin } from "~/lib/db/queries/images";
import { removeTruckByVin } from "~/lib/db/queries/trucks";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import deleteS3Objects from "~/utils/delete-s3-objects";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    return createError({
      statusCode: 403,
      statusMessage: "Only managers can delete trucks.",
    });
  }

  const vin = getRouterParam(event, "vin") as string;
  const imageKeys = await findTruckReportImageKeysByTruckVin(vin);

  if (imageKeys.length) {
    try {
      const client = createS3Client();
      await deleteS3Objects(client, env.S3_BUCKET, imageKeys);
    }
    catch {
      return createError({
        statusCode: 502,
        statusMessage: "Failed to delete truck images from storage.",
      });
    }
  }

  const deleted = await removeTruckByVin(vin);

  if (!deleted) {
    return createError({
      statusCode: 404,
      statusMessage: "Truck not found",
    });
  }

  setResponseStatus(event, 204);
});
