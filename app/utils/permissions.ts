type UserLike = {
  id?: number | string | null;
  isManager?: boolean | null;
};

export function isManagerUser(user: UserLike | null | undefined) {
  return user?.isManager === true;
}

export function isOwnerId(user: UserLike | null | undefined, ownerId: number | null | undefined) {
  if (!user?.id || !ownerId) {
    return false;
  }

  return Number(user.id) === ownerId;
}
