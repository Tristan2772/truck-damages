import { ALLOWED_AUTH_EMAIL_DOMAINS } from "~/lib/constants";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getEmailDomain(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const atIndex = normalizedEmail.lastIndexOf("@");

  if (atIndex === -1 || atIndex === normalizedEmail.length - 1) {
    return "";
  }

  return normalizedEmail.slice(atIndex + 1);
}

const allowedAuthEmailDomains = new Set(ALLOWED_AUTH_EMAIL_DOMAINS.map(domain => domain.toLowerCase()));

export function isAllowedAuthEmail(email: string) {
  const domain = getEmailDomain(email);
  return Boolean(domain) && allowedAuthEmailDomains.has(domain);
}
