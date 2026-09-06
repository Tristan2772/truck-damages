import { findAllArchivedTrucks } from "~/lib/db/queries/trucks";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can view archived trucks.",
    });
  }

  return findAllArchivedTrucks();
});
