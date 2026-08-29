import { findAllUsers } from "~/lib/db/queries/users";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have permission to view all users.",
    });
  }

  return findAllUsers();
});
