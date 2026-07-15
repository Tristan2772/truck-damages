import { findReportByName, updateReportById } from "~/lib/db/queries/reports";
import { InsertTruckReport } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const reportId = Number(getRouterParam(event, "id"));
  const result = await readValidatedBody(event, InsertTruckReport.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingReport = await findReportByName(result.data, event.context.user.id);
  if (existingReport && existingReport.id !== reportId) {
    return createError({
      statusCode: 409,
      statusMessage: "A report with that name already exists",
    });
  }

  return updateReportById(result.data, reportId, event.context.user.id);
});
