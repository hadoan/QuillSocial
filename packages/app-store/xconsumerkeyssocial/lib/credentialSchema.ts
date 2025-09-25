import { z } from "zod";

export const xconsumerkeysCredentialSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  secret: z.string().min(1, "API Secret is required"),
  accessToken: z.string().optional(), // Optional for backward compatibility, but required for posting
  accessSecret: z.string().optional(), // Optional for backward compatibility, but required for posting
});

export type XConsumerKeysCredential = z.infer<
  typeof xconsumerkeysCredentialSchema
>;
