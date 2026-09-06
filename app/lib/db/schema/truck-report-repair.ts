import z from "zod";

export const InsertRepair = z.object({
  repairedBy: z.string().trim().min(1).max(100),
  repairedAt: z.coerce.number().int().positive(),
  repairCost: z.coerce.number().nonnegative().multipleOf(0.01),
  description: z.string().trim().max(1000).optional(),
  ungroundTruck: z.boolean().optional(),
});

export type InsertRepair = z.infer<typeof InsertRepair>;
