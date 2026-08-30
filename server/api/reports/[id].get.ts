import z from "zod";

import { findReportsAssignedToUserId, findReportsByUserId } from "~/lib/db/queries/reports";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerEmail } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerEmail(event.context.user.email)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have permission to view these reports.",
    });
  }

  const id = getRouterParam(event, "id");
  const parsedUserId = z.coerce.number().int().positive().safeParse(id);

  if (!parsedUserId.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid user id.",
    });
  }

  const mode = z.enum(["created", "assigned"]).catch("created").parse(getQuery(event).mode);
  return mode === "assigned"
    ? findReportsAssignedToUserId(parsedUserId.data)
    : findReportsByUserId(parsedUserId.data);
});
