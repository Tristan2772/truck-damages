import { like, or } from "drizzle-orm";

import db from "..";
import { user } from "../schema";

export type UserSearchResult = Pick<typeof user.$inferSelect, "id" | "name" | "email">;

export async function findUserById(userId: number) {
  return db.query.user.findFirst({
    where: (fields, operators) => operators.eq(fields.id, userId),
  });
}

export async function searchUsers(searchTerm: string, limit = 8): Promise<UserSearchResult[]> {
  const match = `%${searchTerm.trim()}%`;

  return db.select({
    id: user.id,
    name: user.name,
    email: user.email,
  }).from(user).where(or(
    like(user.name, match),
    like(user.email, match),
  )).orderBy(user.name).limit(limit);
}
