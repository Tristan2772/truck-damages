import { findTruckReportImageKeysByTruckVin } from "~/lib/db/queries/images";
import { removeTruckByVin } from "~/lib/db/queries/trucks";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import deleteS3Objects from "~/utils/delete-s3-objects";

export default defineAuthenticatedEventHandler(async (event) => {
  const vin = getRouterParam(event, "vin") as string;
  const imageKeys = await findTruckReportImageKeysByTruckVin(vin, event.context.user.id);

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

  const deleted = await removeTruckByVin(vin, event.context.user.id);

  if (!deleted) {
    return createError({
      statusCode: 404,
      statusMessage: "Truck not found",
    });
  }

  setResponseStatus(event, 204);
});
