import { z } from "zod";

export const linkedinCredentialSchema = z.object({
  token: z.object({
    scope: z.string(),
    token_type: z.literal("Bearer"),
    expires_in: z.number(),
    access_token: z.string(),
    id_token: z.string(),
  }),
});
