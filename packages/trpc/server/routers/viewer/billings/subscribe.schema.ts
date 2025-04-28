import { z } from "zod";

export const ZSubscribeInputSchema = z.object({
  billingType: z.enum(["freeTier", "team", "perUser", "ltd"]),
});

export type TSubscribeInputSchema = z.infer<typeof ZSubscribeInputSchema>;
