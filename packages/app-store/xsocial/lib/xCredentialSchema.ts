import { z } from "zod";

export const xCredentialSchema = z.object({
  token: z.object({
    scope: z.array(z.string()),
    token_type: z.literal("bearer"),
    expires_at: z.number(),
    access_token: z.string(),
    refresh_token: z.string(),
  }),
});
