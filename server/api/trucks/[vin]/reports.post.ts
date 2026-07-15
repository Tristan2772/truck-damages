import { insertTruckReport } from "~/lib/db/queries/reports";
import { findTruck } from "~/lib/db/queries/trucks";
import { InsertTruckReport } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const vin = getRouterParam(event, "vin") as string;
  const truck = await findTruck(vin, event.context.user.id);
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

  return insertTruckReport(truck.id, result.data, event.context.user.id);
});
