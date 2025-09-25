import { ChargerCardSchema } from "./type";
import type { z } from "zod";

export const ZChargerCardInputSchema = ChargerCardSchema;

export type TChargeCardInputSchema = z.infer<typeof ZChargerCardInputSchema>;
