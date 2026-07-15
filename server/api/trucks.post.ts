import type { DrizzleError } from "drizzle-orm";

import { InsertTruck } from "~/lib/db/schema";

import { findTruckByName, findTruckByVin, insertTruck } from "../../app/lib/db/queries/trucks";
import sendZodError from "../../app/utils/send-zod-error";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    }));
  }
  const result = await readValidatedBody(event, InsertTruck.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingTruckName = await findTruckByName(result.data);
  if (existingTruckName) {
    return createError({
      statusCode: 409,
      statusMessage: "A truck with that name already exists",
    });
  }
  const existingTruckVin = await findTruckByVin(result.data.vin);
  if (existingTruckVin) {
    return createError({
      statusCode: 409,
      statusMessage: "A truck with that VIN already exists",
    });
  }

  const vin = result.data.vin;

  try {
    return insertTruck(result.data, vin, event.context.user.id);
  }
  catch (e) {
    const error = e as DrizzleError;
    if (error.message === "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: trucks.vin") {
      return createError({
        statusCode: 409,
        statusMessage: "VIN must be unique.",
      });
    }
    throw error;
  }
});
