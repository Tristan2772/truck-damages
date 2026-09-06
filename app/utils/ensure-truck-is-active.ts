import { findTruckByVin } from "~/lib/db/queries/trucks";

export default async function ensureTruckIsActive(vin: string) {
  const truck = await findTruckByVin(vin);

  if (!truck) {
    throw createError({
      statusCode: 404,
      statusMessage: "Truck not found.",
    });
  }

  if (truck.archivedAt) {
    throw createError({
      statusCode: 409,
      statusMessage: "Archived trucks cannot be modified.",
    });
  }

  return truck;
}
