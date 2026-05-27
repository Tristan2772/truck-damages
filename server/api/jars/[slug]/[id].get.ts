import z from "zod";

import { findJar } from "~/lib/db/queries/jars";
import { findNote } from "~/lib/db/queries/notes";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;
  const jar = await findJar(slug, event.context.user.id);

  if (!jar) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Jar not found.",
    }));
  }

  if (!z.coerce.number().safeParse(id).success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: "Invalid Id.",
    }));
  }

  const note = await findNote(Number(id), event.context.user.id);

  if (!note) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Note not found.",
    }));
  }

  return note;
});
