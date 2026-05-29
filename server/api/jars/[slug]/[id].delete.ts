import z from "zod";

import { findJarNoteImageKeysByNoteId } from "~/lib/db/queries/images";
import { removeNoteById } from "~/lib/db/queries/notes";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import deleteS3Objects from "~/utils/delete-s3-objects";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as string;
  const slug = getRouterParam(event, "slug") as string;

  if (!z.coerce.number().safeParse(id).success) {
    return createError({
      statusCode: 422,
      statusMessage: "Invalid Id.",
    });
  }

  await event.$fetch(`/api/jars/${slug}/${id}`);

  const imageKeys = await findJarNoteImageKeysByNoteId(Number(id), event.context.user.id);

  if (imageKeys.length) {
    try {
      const client = createS3Client();
      await deleteS3Objects(client, env.S3_BUCKET, imageKeys);
    }
    catch {
      return createError({
        statusCode: 502,
        statusMessage: "Failed to delete note images from storage.",
      });
    }
  }

  const deleted = await removeNoteById(Number(id), event.context.user.id);

  if (!deleted) {
    return createError({
      statusCode: 404,
      statusMessage: "Note not found",
    });
  }

  setResponseStatus(event, 204);
});
