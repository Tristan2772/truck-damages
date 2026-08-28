import z from "zod";

import { searchUsers } from "~/lib/db/queries/users";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import { isManagerUser } from "~/utils/permissions";

const SearchQuery = z.object({
  q: z.string().trim().min(2).max(100),
});

export default defineAuthenticatedEventHandler(async (event) => {
  if (!isManagerUser(event.context.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only managers can search users.",
    });
  }

  const parsedQuery = SearchQuery.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "User search query must be between 2 and 100 characters.",
    });
  }

  return searchUsers(parsedQuery.data.q);
});
