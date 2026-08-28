import type { InsertTruckReport as InsertTruckReportInput } from "~/lib/db/schema";

import { insertTruckReport } from "~/lib/db/queries/reports";
import { findTruck } from "~/lib/db/queries/trucks";
import { findUserById } from "~/lib/db/queries/users";
import { InsertTruckReport } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const vin = getRouterParam(event, "vin") as string;
  const truck = await findTruck(vin);
  if (!truck) {
    return createError({
      statusCode: 404,
      statusMessage: "Truck not found.",
    });
  }

  const result = await readValidatedBody(event, InsertTruckReport.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const isManager = isManagerUser(event.context.user);
  const { assignedTo } = result.data;
  const unassignedReport: InsertTruckReportInput = {
    name: result.data.name,
    truckVin: result.data.truckVin,
    description: result.data.description,
    isGrounded: result.data.isGrounded,
  };

  if (isManager && assignedTo != null && !await findUserById(assignedTo)) {
    throw createError({
      statusCode: 422,
      statusMessage: "The selected user does not exist.",
    });
  }

  const insertable = isManager
    ? result.data
    : unassignedReport;

  return insertTruckReport(truck.id, insertable, event.context.user.id);
});
