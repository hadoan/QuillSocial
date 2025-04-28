import { z } from "zod";

export const facebookCredentialSchema = z.object({
  token_type: z.literal("bearer"),
  expires_in: z.number(),
  access_token: z.string(),
});
