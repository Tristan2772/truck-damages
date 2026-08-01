import { findTruckByName, findTruckByVin, updateTruckByVin } from "~/lib/db/queries/trucks";
import { InsertTruck } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    return createError({
      statusCode: 403,
      statusMessage: "Only managers can edit trucks.",
    });
  }

  const vin = getRouterParam(event, "vin") as string;
  const result = await readValidatedBody(event, InsertTruck.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingTruck = await findTruckByVin(result.data.vin);
  if (existingTruck && existingTruck.vin !== vin) {
    return createError({
      statusCode: 409,
      statusMessage: "A truck with that VIN already exists",
    });
  }

  const existingTruckName = await findTruckByName(result.data.name);
  if (existingTruckName && existingTruckName.vin !== vin) {
    return createError({
      statusCode: 409,
      statusMessage: "A truck with that name already exists",
    });
  }

  return updateTruckByVin(result.data, vin);
});
