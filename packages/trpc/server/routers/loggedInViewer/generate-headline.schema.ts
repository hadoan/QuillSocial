import { z } from "zod";

export const ZGenerateHeadlineInputSchema = z.object({
  cv: z.string(),
});

export type TGenerateHeadlineInputSchema = z.infer<typeof ZGenerateHeadlineInputSchema>;
