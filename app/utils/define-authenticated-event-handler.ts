import type { H3Event, H3EventContext } from "h3";

import type { userWithId } from "~/lib/auth";

import { findUserById } from "~/lib/db/queries/users";

type AuthenticatedEvent = H3Event & {
  context: H3EventContext & {
    user: userWithId;
  };
};

export default function defineAuthenticatedEventHandler<T>(
  handler: (event: AuthenticatedEvent) => T,
) {
  return defineEventHandler(async (event) => {
    if (!event.context.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const user = await findUserById(Number(event.context.user.id));
    if (!user || user.archivedAt) {
      throw createError({
        statusCode: 403,
        statusMessage: "This account has been archived.",
      });
    }

    return handler(event as AuthenticatedEvent);
  });
}
