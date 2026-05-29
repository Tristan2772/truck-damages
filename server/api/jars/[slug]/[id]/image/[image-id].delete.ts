import z from "zod";

import { deleteJarNoteImage, findJarNoteImageById } from "~/lib/db/queries/images";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import deleteS3Objects from "~/utils/delete-s3-objects";

export default defineAuthenticatedEventHandler(async (event) => {
  const imageId = getRouterParam(event, "image-id") as string;

  if (!z.coerce.number().safeParse(imageId).success) {
    return createError({
      statusCode: 422,
      statusMessage: "Invalid Image Id.",
    });
  }

  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;

  if (!z.coerce.number().safeParse(id).success) {
    return createError({
      statusCode: 422,
      statusMessage: "Invalid Id.",
    });
  }

  await event.$fetch(`/api/jars/${slug}/${id}`);

  const existing = await findJarNoteImageById(Number(imageId), event.context.user.id);

  if (!existing || existing.jarNoteId !== Number(id)) {
    return createError({
      statusCode: 404,
      statusMessage: "Image not found.",
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

  const deleted = await deleteJarNoteImage(Number(imageId), event.context.user.id);

  if (!deleted) {
    return createError({
      statusCode: 404,
      statusMessage: "Image not found.",
    });
  }

  setResponseStatus(event, 204);
});
