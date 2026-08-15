import { findAllReports } from "~/lib/db/queries/reports";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerEmail } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerEmail(event.context.user.email)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have permission to view all reports.",
    });
  }

  return findAllReports();
});
