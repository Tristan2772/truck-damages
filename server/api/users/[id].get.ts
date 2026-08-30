import z from "zod";

import { findUserById } from "~/lib/db/queries/users";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have permission to view this user.",
    });
  }

  const parsedUserId = z.coerce.number().int().positive().safeParse(getRouterParam(event, "id"));

  if (!parsedUserId.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid user id.",
    });
  }

  const foundUser = await findUserById(parsedUserId.data);

  if (!foundUser) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  return foundUser;
});
