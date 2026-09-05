import z from "zod";

import { findAllArchivedUsers } from "~/lib/db/queries/users";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can view archived users.",
    });
  }

  const mode = z.enum(["created", "assigned"]).catch("created").parse(getQuery(event).mode);
  return findAllArchivedUsers(mode);
});
