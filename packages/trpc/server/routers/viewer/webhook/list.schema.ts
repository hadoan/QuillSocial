import { webhookIdAndEventTypeIdSchema } from "./types";
import { z } from "zod";

export const ZListInputSchema = webhookIdAndEventTypeIdSchema
  .extend({
    appId: z.string().optional(),
    teamId: z.number().optional(),
    eventTypeId: z.number().optional(),
  })
  .optional();

export type TListInputSchema = z.infer<typeof ZListInputSchema>;
