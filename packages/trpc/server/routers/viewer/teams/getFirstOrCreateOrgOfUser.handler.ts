import { addSeconds } from "date-fns";

import { getTeamWithMembers } from "@quillsocial/lib/server/queries/teams";
import { prisma } from "@quillsocial/prisma";
import { MembershipRole } from "@quillsocial/prisma/enums";

import { TrpcSessionUser } from "../../../trpc";

type getFirstOrCreateOrgOfUserOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const getFirstOrCreateOrgOfUserHandler = async ({
  ctx,
}: getFirstOrCreateOrgOfUserOptions) => {
  const team = await getTeamWithMembers(undefined, undefined, ctx.user.id);
  if (!team) {
    const createTeam = await prisma.team.create({
      data: {
        name: ctx.user.username ?? "default-name",
        logo: undefined,
        members: {
          create: {
            userId: ctx.user.id,
            role: MembershipRole.OWNER,
            accepted: true,
          },
        },
        metadata: {
          requestedSlug: "test-slug",
        },
        startTrialDate: addSeconds(new Date(0), Math.floor(Date.now() / 1000)),
      },
    });
    return createTeam;
  }
  return team;
};
