import z from "zod";

export const InsertRepair = z.object({
  repairedBy: z.string().trim().min(1).max(100),
  repairedAt: z.coerce.number().int().positive(),
  repairCost: z.coerce.number().nonnegative().multipleOf(0.01),
  ungroundTruck: z.boolean().optional(),
});

export type InsertRepair = z.infer<typeof InsertRepair>;
