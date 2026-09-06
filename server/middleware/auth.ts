import type { userWithId } from "~/lib/auth";

import { auth } from "~/lib/auth";
import { findUserById } from "~/lib/db/queries/users";
import { isManagerEmail } from "~/utils/permissions";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });
  event.context.user = session?.user as unknown as userWithId;

  const user = session?.user ? await findUserById(Number(session.user.id)) : null;
  const isArchived = Boolean(user?.archivedAt);

  if (event.path.startsWith("/damages")) {
    if (!session?.user || isArchived) {
      await sendRedirect(event, "/", 302);
    }
  }

  if (event.path.startsWith("/damages/add-truck")) {
    if (!isManagerEmail(session?.user?.email)) {
      await sendRedirect(event, "/damages", 302);
    }
  }
});
