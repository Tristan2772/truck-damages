import z from "zod";

import { deleteTruckReportImage, findTruckReportImageById } from "~/lib/db/queries/images";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import deleteS3Objects from "~/utils/delete-s3-objects";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  const isManager = isManagerUser(event.context.user);
  const requestUserId = Number(event.context.user.id);
  const imageId = getRouterParam(event, "image-id") as string;

  if (!z.coerce.number().safeParse(imageId).success) {
    return createError({
      statusCode: 422,
      statusMessage: "Invalid Image Id.",
    });
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

  const existing = await findTruckReportImageById(Number(imageId));

  if (!existing || existing.truckReportId !== Number(id)) {
    return createError({
      statusCode: 404,
      statusMessage: "Image not found.",
    });
  }

  if (!isManager && existing.userId !== requestUserId) {
    return createError({
      statusCode: 403,
      statusMessage: "Only managers and image owners can delete images.",
    });
  }

  try {
    const client = createS3Client();
    await deleteS3Objects(client, env.S3_BUCKET, [existing.key]);
  }
  catch {
    return createError({
      statusCode: 502,
      statusMessage: "Failed to delete image from storage.",
    });
  }

  const deleted = await deleteTruckReportImage(Number(imageId));

  if (!deleted) {
    return createError({
      statusCode: 404,
      statusMessage: "Image not found.",
    });
  }

  setResponseStatus(event, 204);
});
