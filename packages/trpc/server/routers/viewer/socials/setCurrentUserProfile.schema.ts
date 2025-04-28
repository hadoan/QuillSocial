import { z } from "zod";

export const ZCurrentUserProfileInputSchema = z.object({
  id: z.number(),
  isUserCurrentProfile: z.boolean().optional(),
  pageId: z.string().optional()
});

export type TCurrentUserProfileInputSchema = z.infer<typeof ZCurrentUserProfileInputSchema>;
