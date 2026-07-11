import type { DrizzleError } from "drizzle-orm";

import slugify from "slug";

import { InsertJar } from "~/lib/db/schema";

import { findJarByName, findUniqueSlug, insertJar } from "../../app/lib/db/queries/jars";
import { findShelfById } from "../../app/lib/db/queries/shelves";
import sendZodError from "../../app/utils/send-zod-error";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    }));
  }
  const result = await readValidatedBody(event, InsertJar.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingJar = await findJarByName(result.data, event.context.user.id);
  if (existingJar) {
    return createError({
      statusCode: 409,
      statusMessage: "A jar with that name already exists",
    });
  }

  if (typeof result.data.shelf === "number") {
    const shelf = await findShelfById(result.data.shelf, event.context.user.id);
    if (!shelf) {
      return createError({
        statusCode: 400,
        statusMessage: "Invalid shelf selected",
      });
    }
  }

  const slug = await findUniqueSlug(slugify(result.data.name));

  try {
    return insertJar(result.data, slug, event.context.user.id);
  }
  catch (e) {
    const error = e as DrizzleError;
    if (error.message === "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: jars.slug") {
      return createError({
        statusCode: 409,
        statusMessage: "Slug must be unique (the slug is generated using the jar name).",
      });
    }
    throw error;
  }
});
