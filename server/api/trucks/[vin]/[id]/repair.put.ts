import { findReport, markReportRepaired } from "~/lib/db/queries/reports";
import { InsertRepair } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can mark damages as repaired.",
    });
  }

  const reportId = Number(getRouterParam(event, "id"));
  const result = await readValidatedBody(event, InsertRepair.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  if (!await findReport(reportId)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Report not found",
    });
  }

  return markReportRepaired(result.data, reportId, Number(event.context.user.id));
});
