import type { InsertTruckReport as InsertTruckReportInput } from "~/lib/db/schema";

import { findReport, findReportByName, updateReportById } from "~/lib/db/queries/reports";
import { findUserById } from "~/lib/db/queries/users";
import { InsertTruckReport } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const isManager = isManagerUser(event.context.user);
  const requestUserId = Number(event.context.user.id);
  const reportId = Number(getRouterParam(event, "id"));
  const result = await readValidatedBody(event, InsertTruckReport.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const report = await findReport(reportId);
  if (!report) {
    return createError({
      statusCode: 404,
      statusMessage: "Report not found",
    });
  }

  if (!isManager && report.userId !== requestUserId) {
    return createError({
      statusCode: 403,
      statusMessage: "Only managers and report owners can edit reports.",
    });
  }

  if (isManager && result.data.assignedTo != null && !await findUserById(result.data.assignedTo)) {
    throw createError({
      statusCode: 422,
      statusMessage: "The selected user does not exist.",
    });
  }

  const unassignedReport: InsertTruckReportInput = {
    name: result.data.name,
    truckVin: result.data.truckVin,
    description: result.data.description,
    isGrounded: result.data.isGrounded,
  };

  const existingReport = await findReportByName(result.data, report.userId);
  if (existingReport && existingReport.id !== reportId) {
    return createError({
      statusCode: 409,
      statusMessage: "A report with that name already exists",
    });
  }

  const updates = isManager
    ? result.data
    : unassignedReport;

  return updateReportById(updates, reportId);
});
