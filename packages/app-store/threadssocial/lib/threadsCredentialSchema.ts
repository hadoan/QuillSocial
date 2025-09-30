import { z } from "zod";

export const threadsCredentialSchema = z.object({
  token: z.object({
    access_token: z.string(),
    token_type: z.literal("bearer").optional(),
    expires_in: z.number().optional(),
    user_id: z.string().optional(),
    refresh_token: z.string().optional(),
  }),
});
