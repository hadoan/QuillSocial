import { z } from "zod";

export const ZGenerateAboutInputSchema = z.object({
  cv: z.string(),
});

export type TGenerateAboutInputSchema = z.infer<
  typeof ZGenerateAboutInputSchema
>;
