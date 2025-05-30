import { MembershipRole } from "@quillsocial/prisma/enums";
import { z } from "zod";

export const ZChangeMemberRoleInputSchema = z.object({
  teamId: z.number(),
  memberId: z.number(),
  role: z.nativeEnum(MembershipRole),
});

export type TChangeMemberRoleInputSchema = z.infer<
  typeof ZChangeMemberRoleInputSchema
>;
