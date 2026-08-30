import { findReport, removeReportRepair } from "~/lib/db/queries/reports";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can delete repair details.",
    });
  }

  const reportId = Number(getRouterParam(event, "id"));

  if (!await findReport(reportId)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Report not found",
    });
  }

  return removeReportRepair(reportId);
});
