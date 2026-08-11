import z from "zod";

import { searchHeaderMatches } from "~/lib/db/queries/trucks";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

const SearchQuery = z.object({
  q: z.string().trim().min(2).max(100),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const parsedQuery = SearchQuery.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Search query must be between 2 and 100 characters.",
    });
  }

  return searchHeaderMatches(parsedQuery.data.q);
});
