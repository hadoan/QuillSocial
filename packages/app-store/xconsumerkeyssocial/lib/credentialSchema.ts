import { z } from "zod";

export const xconsumerkeysCredentialSchema = z.object({
  apiKey: z.string(),
  secret: z.string(),
});

export type XConsumerKeysCredential = z.infer<typeof xconsumerkeysCredentialSchema>;
