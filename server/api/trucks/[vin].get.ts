import { findTruck } from "~/lib/db/queries/trucks";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const vin = getRouterParam(event, "vin") as string;
  const truck = await findTruck(vin, event.context.user.id);
  if (!truck) {
    return createError({
      statusCode: 404,
      statusMessage: "Truck not found.",
    });
  }

  return truck;
});
