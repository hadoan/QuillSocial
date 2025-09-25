import { webhookIdAndEventTypeIdSchema } from "./types";
import { z } from "zod";

export const ZGetInputSchema = webhookIdAndEventTypeIdSchema.extend({
  webhookId: z.string().optional(),
});

export type TGetInputSchema = z.infer<typeof ZGetInputSchema>;
