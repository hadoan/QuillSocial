import { isTeamAdmin, isTeamOwner } from "@quillsocial/lib/server/queries/teams";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import type { PrismaClient } from "@prisma/client";

import { TRPCError } from "@trpc/server";

import type { TRemoveMemberInputSchema } from "./removeMember.schema";
import { InputGroupBox } from "@quillsocial/ui";

type RemoveMemberOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    prisma: PrismaClient;
  };
  input: TRemoveMemberInputSchema;
};

export const removeMemberHandler = async ({ ctx, input }: RemoveMemberOptions) => {
  const isAdmin = await isTeamAdmin(ctx.user.id, input.teamId);
  if (!isAdmin && ctx.user.id !== input.memberId) throw new TRPCError({ code: "UNAUTHORIZED" });
  // Only a team owner can remove another team owner.
  if ((await isTeamOwner(input.memberId, input.teamId)) && !(await isTeamOwner(ctx.user.id, input.teamId)))
    throw new TRPCError({ code: "UNAUTHORIZED" });

  if (ctx.user.id === input.memberId && isAdmin)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can not remove yourself from a team you own.",
    });

  const checkrole = await ctx.prisma.membership.findFirst({
    where: {
     userId: input.memberId
    },
  });
  if (checkrole?.role === "ADMIN")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can not remove member who is admin.",
    });
  const membership = await ctx.prisma.membership.delete({
    where: {
      userId_teamId: { userId: input.memberId, teamId: input.teamId },
    },
    include: {
      user: true,
    },
  });

 
  if (input.isOrg) {
    // Deleting membership from all child teams
    await ctx.prisma.membership.deleteMany({
      where: {
        team: {
          parentId: input.teamId,
        },
        userId: membership.userId,
      },
    });

    await ctx.prisma.user.update({
      where: { id: membership.userId },
      data: { organizationId: null },
    });
  }

  
  // If the user has invited but has not registered, they can be deleted, cuz rule check member of invite member in line 99 
  await ctx.prisma.user.deleteMany({
    where: {
      id: input.memberId,
      username:null,
      name:null,
    },
  });
  
};
