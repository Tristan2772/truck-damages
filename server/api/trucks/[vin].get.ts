import { findTruck } from "~/lib/db/queries/trucks";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const vin = getRouterParam(event, "vin") as string;
  const truck = await findTruck(vin);
  if (!truck) {
    return createError({
      statusCode: 404,
      statusMessage: "Truck not found.",
    });
  }

  return truck;
});
