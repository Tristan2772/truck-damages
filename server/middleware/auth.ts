import type { userWithId } from "~/lib/auth";

import { auth } from "~/lib/auth";
import { isManagerEmail } from "~/utils/permissions";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });
  event.context.user = session?.user as unknown as userWithId;

  if (event.path.startsWith("/damages")) {
    if (!session?.user) {
      await sendRedirect(event, "/", 302);
    }
  }

  if (event.path.startsWith("/damages/add-truck")) {
    if (!isManagerEmail(session?.user?.email)) {
      await sendRedirect(event, "/damages", 302);
    }
  }
});
