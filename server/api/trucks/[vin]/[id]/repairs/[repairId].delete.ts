import { findRepairById, removeRepair } from "~/lib/db/queries/reports";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import ensureTruckIsActive from "~/utils/ensure-truck-is-active";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can delete repair details.",
    });
  }

  const reportId = Number(getRouterParam(event, "id"));
  const repairId = Number(getRouterParam(event, "repairId"));
  const vin = getRouterParam(event, "vin") as string;
  await ensureTruckIsActive(vin);

  if (!await findRepairById(repairId, reportId)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Repair not found",
    });
  }

  return removeRepair(repairId, reportId);
});
