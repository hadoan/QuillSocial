import { z } from "zod";

export const xCredentialSchema = z.object({
  token: z.object({
    userId: z.string(),
    screenName: z.string(),
    accessToken: z.string(),
    accessSecret: z.string()
  }),
}); 
