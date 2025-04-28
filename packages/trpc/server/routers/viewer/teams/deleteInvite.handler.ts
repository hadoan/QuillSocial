import { isTeamAdmin } from "@quillsocial/lib/server/queries/teams";
import { prisma } from "@quillsocial/prisma";
import { TRPCError } from "@quillsocial/trpc/server";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

import type { TDeleteInviteInputSchema } from "./deleteInvite.schema";

type DeleteInviteOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TDeleteInviteInputSchema;
};

export const deleteInviteHandler = async ({ ctx, input }: DeleteInviteOptions) => {
  const { token } = input;

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: token,
    },
    select: {
      teamId: true,
      id: true,
    },
  });

  if (!verificationToken) throw new TRPCError({ code: "NOT_FOUND" });
  if (!verificationToken.teamId || !(await isTeamAdmin(ctx.user.id, verificationToken.teamId)))
    throw new TRPCError({ code: "UNAUTHORIZED" });

  await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
};
