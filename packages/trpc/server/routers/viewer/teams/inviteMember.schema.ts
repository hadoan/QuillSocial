import { MembershipRole } from "@quillsocial/prisma/enums";
import { z } from "zod";

export const ZInviteMemberInputSchema = z.object({
  teamId: z.number(),
  usernameOrEmail: z.union([z.string(), z.array(z.string())]).transform((usernameOrEmail) => {
    if (typeof usernameOrEmail === "string") {
      return usernameOrEmail.trim().toLowerCase();
    }
    return usernameOrEmail.map((item) => item.trim().toLowerCase());
  }),
  role: z.nativeEnum(MembershipRole),
  language: z.string(),
  sendEmailInvitation: z.boolean(),
  isOrg: z.boolean().default(false),
});

export type TInviteMemberInputSchema = z.infer<typeof ZInviteMemberInputSchema>;
