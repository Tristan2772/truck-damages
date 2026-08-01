import { MANAGER_EMAILS } from "~/lib/constants";

type UserLike = {
  id?: number | string | null;
  email?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const normalizedManagerEmails = new Set(MANAGER_EMAILS.map(normalizeEmail));

export function isManagerEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return normalizedManagerEmails.has(normalizeEmail(email));
}

export function isManagerUser(user: UserLike | null | undefined) {
  return isManagerEmail(user?.email);
}

export function isOwnerId(user: UserLike | null | undefined, ownerId: number | null | undefined) {
  if (!user?.id || !ownerId) {
    return false;
  }

  return Number(user.id) === ownerId;
}
