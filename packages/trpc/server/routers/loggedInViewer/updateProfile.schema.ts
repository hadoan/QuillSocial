import { FULL_NAME_LENGTH_MAX_LIMIT } from "@quillsocial/lib/constants";
import { userMetadata } from "@quillsocial/prisma/zod-utils";
import { z } from "zod";

export const ZUpdateProfileInputSchema = z.object({
  username: z.string().optional(),
  name: z.string().max(FULL_NAME_LENGTH_MAX_LIMIT).optional(),
  email: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  timeZone: z.string().optional(),
  weekStart: z.string().optional(),
  hideBranding: z.boolean().optional(),
  allowDynamicBooking: z.boolean().optional(),
  brandColor: z.string().optional(),
  darkBrandColor: z.string().optional(),
  theme: z.string().optional().nullable(),
  completedOnboarding: z.boolean().optional(),
  locale: z.string().optional(),
  timeFormat: z.number().optional(),
  disableImpersonation: z.boolean().optional(),
  metadata: userMetadata.optional(),
  mobile: z.string().optional(),
  description: z.string().optional(),
  speakAbout: z.string().optional(),
});

export type TUpdateProfileInputSchema = z.infer<
  typeof ZUpdateProfileInputSchema
>;
