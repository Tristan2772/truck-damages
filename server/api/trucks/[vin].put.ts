import { findTruckByVin, updateTruckByVin } from "~/lib/db/queries/trucks";
import { InsertTruck } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const vin = getRouterParam(event, "vin") as string;
  const result = await readValidatedBody(event, InsertTruck.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingTruck = await findTruckByVin(result.data.vin);
  if (existingTruck && existingTruck.vin !== vin) {
    return createError({
      statusCode: 409,
      statusMessage: "A truck with that vin already exists",
    });
  }

  return updateTruckByVin(result.data, vin, event.context.user.id);
});
