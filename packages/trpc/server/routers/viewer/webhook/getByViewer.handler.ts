import { MY_APP_URL } from "@quillsocial/lib/constants";
import { prisma } from "@quillsocial/prisma";
import type { Webhook } from "@quillsocial/prisma/client";
import { MembershipRole } from "@quillsocial/prisma/enums";
import { teamMetadataSchema } from "@quillsocial/prisma/zod-utils";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

import { TRPCError } from "@trpc/server";

type GetByViewerOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

type WebhookGroup = {
  teamId?: number | null;
  profile: {
    slug: string | null;
    name: string | null;
    image?: string;
  };
  metadata?: {
    readOnly: boolean;
  };
  webhooks: Webhook[];
};

export type WebhooksByViewer = {
  webhookGroups: WebhookGroup[];
  profiles: {
    readOnly?: boolean | undefined;
    slug: string | null;
    name: string | null;
    image?: string | undefined;
    teamId: number | null | undefined;
  }[];
};

export const getByViewerHandler = async ({ ctx }: GetByViewerOptions) => {
  const user = await prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
    select: {
      username: true,
      avatar: true,
      name: true,
      webhooks: true,
      teams: {
        where: {
          accepted: true,
        },
        select: {
          role: true,
          team: {
            select: {
              id: true,
              name: true,
              slug: true,
              parentId: true,
              metadata: true,
              members: {
                select: {
                  userId: true,
                },
              },
              webhooks: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  const userWebhooks = user.webhooks;
  let webhookGroups: WebhookGroup[] = [];

  const image = user?.username
    ? `${MY_APP_URL}/${user.username}/avatar.png`
    : undefined;
  webhookGroups.push({
    teamId: null,
    profile: {
      slug: user.username,
      name: user.name,
      image,
    },
    webhooks: userWebhooks,
    metadata: {
      readOnly: false,
    },
  });

  const teamMemberships = user.teams.map((membership) => ({
    teamId: membership.team.id,
    membershipRole: membership.role,
  }));

  const teamWebhookGroups: WebhookGroup[] = user.teams
    .filter((mmship) => {
      const metadata = teamMetadataSchema.parse(mmship.team.metadata);
      return !metadata?.isOrganization;
    })
    .map((membership) => {
      const orgMembership = teamMemberships.find(
        (teamM) => teamM.teamId === membership.team.parentId
      )?.membershipRole;
      return {
        teamId: membership.team.id,
        profile: {
          name: membership.team.name,
          slug: membership.team.slug
            ? !membership.team.parentId
              ? `/team`
              : "" + membership.team.slug
            : null,
          image: `${MY_APP_URL}/team/${membership.team.slug}/avatar.png`,
        },
        metadata: {
          readOnly:
            membership.role ===
            (membership.team.parentId
              ? orgMembership
                ? orgMembership
                : MembershipRole.MEMBER
              : MembershipRole.MEMBER),
        },
        webhooks: membership.team.webhooks,
      };
    });

  webhookGroups = webhookGroups.concat(teamWebhookGroups);

  return {
    webhookGroups: webhookGroups.filter(
      (groupBy) => !!groupBy.webhooks?.length
    ),
    profiles: webhookGroups.map((group) => ({
      teamId: group.teamId,
      ...group.profile,
      ...group.metadata,
      image: `${MY_APP_URL}/${group.profile.slug}/avatar.png`,
    })),
  };
};
