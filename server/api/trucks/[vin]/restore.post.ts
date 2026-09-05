import { findTruckByVin, restoreTruckByVin } from "~/lib/db/queries/trucks";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can restore trucks.",
    });
  }

  const vin = getRouterParam(event, "vin") as string;
  const truck = await findTruckByVin(vin);

  if (!truck) {
    throw createError({
      statusCode: 404,
      statusMessage: "Truck not found.",
    });
  }

  if (!truck.archivedAt) {
    throw createError({
      statusCode: 409,
      statusMessage: "Truck is not archived.",
    });
  }

  return restoreTruckByVin(vin);
});
