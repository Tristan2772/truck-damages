import { auth } from "~/lib/auth";
import { AUTH_EMAIL_DOMAIN_ERROR_MESSAGE } from "~/lib/constants";
import { isAllowedAuthEmail } from "~/utils/auth-email";

const guardedAuthPaths = new Set([
  "/sign-in/email",
  "/sign-up/email",
  "/email-otp/send-verification-otp",
  "/email-otp/verify-email",
]);

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  const isGuardedPath = Array.from(guardedAuthPaths).some(path => pathname.endsWith(path));

  if (isGuardedPath) {
    const body = await readBody<{ email?: string }>(event);
    const email = body?.email;

    if (typeof email !== "string" || !isAllowedAuthEmail(email)) {
      throw createError({
        statusCode: 403,
        statusMessage: AUTH_EMAIL_DOMAIN_ERROR_MESSAGE,
      });
    }
  }

  return auth.handler(toWebRequest(event));
});
