import { findRepairById, updateRepair } from "~/lib/db/queries/reports";
import { InsertRepair } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import ensureTruckIsActive from "~/utils/ensure-truck-is-active";
import { isManagerUser } from "~/utils/permissions";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can edit repair details.",
    });
  }

  const reportId = Number(getRouterParam(event, "id"));
  const repairId = Number(getRouterParam(event, "repairId"));
  const vin = getRouterParam(event, "vin") as string;
  await ensureTruckIsActive(vin);
  const result = await readValidatedBody(event, InsertRepair.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  if (!await findRepairById(repairId, reportId)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Repair not found",
    });
  }

  return updateRepair(result.data, repairId, reportId);
});
