import z from "zod";

import { archiveUserById, findUserById } from "~/lib/db/queries/users";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can archive users.",
    });
  }

  const result = z.coerce.number().int().positive().safeParse(getRouterParam(event, "id"));
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid user id.",
    });
  }

  const user = await findUserById(result.data);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  if (user.archivedAt) {
    throw createError({
      statusCode: 409,
      statusMessage: "User is already archived.",
    });
  }

  return archiveUserById(result.data);
});
