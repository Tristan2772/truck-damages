import z from "zod";

import { findReport } from "~/lib/db/queries/reports";
import { findTruck } from "~/lib/db/queries/trucks";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const vin = getRouterParam(event, "vin") as string;
  const id = getRouterParam(event, "id") as string;
  const truck = await findTruck(vin, event.context.user.id);

  if (!truck) {
    return createError({
      statusCode: 404,
      statusMessage: "Truck not found.",
    });
  }

  if (!z.coerce.number().safeParse(id).success) {
    return createError({
      statusCode: 422,
      statusMessage: "Invalid Id.",
    });
  }

  const report = await findReport(Number(id), event.context.user.id);

  if (!report) {
    return createError({
      statusCode: 404,
      statusMessage: "Report not found.",
    });
  }

  return report;
});
