import { IS_TEAM_BILLING_ENABLED } from "@quillsocial/lib/constants";
import { isOrganisationAdmin } from "@quillsocial/lib/server/queries/organisations";
import { prisma } from "@quillsocial/prisma";
import { MembershipRole } from "@quillsocial/prisma/enums";
import { addSeconds } from "date-fns";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../trpc";
import type { TCreateInputSchema } from "./create.schema";

type CreateOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TCreateInputSchema;
};

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const { slug, name, logo } = input;
  const currentOrgId = ctx.user.organization?.id;
  const slugCollisions = await prisma.team.findFirst({
    where: {
      slug: slug,
      parentId: currentOrgId
        ? {
            equals: currentOrgId,
          }
        : null,
    },
  });

  if (slugCollisions)
    throw new TRPCError({ code: "BAD_REQUEST", message: "team_url_taken" });

  // Ensure that the user is not duplicating a requested team
  const duplicatedRequest = await prisma.team.findFirst({
    where: {
      members: {
        some: {
          userId: ctx.user.id,
        },
      },
      metadata: {
        path: ["requestedSlug"],
        equals: slug,
      },
    },
  });

  if (duplicatedRequest) {
    return duplicatedRequest;
  }

  let parentId: number | null = null;
  // If the user in session is part of an org. check permissions
  if (ctx.user.organization?.id) {
    if (!isOrganisationAdmin(ctx.user.id, ctx.user.organization.id)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const nameCollisions = await prisma.user.findFirst({
      where: {
        organizationId: ctx.user.organization.id,
        username: slug,
      },
    });

    if (nameCollisions)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "team_slug_exists_as_user",
      });

    parentId = ctx.user.organization.id;
  }

  const createTeam = await prisma.team.create({
    data: {
      name,
      logo,
      members: {
        create: {
          userId: ctx.user.id,
          role: MembershipRole.OWNER,
          accepted: true,
        },
      },
      metadata: {
        requestedSlug: slug,
      },
      ...(!IS_TEAM_BILLING_ENABLED && { slug }),
      parent: {
        connect: parentId ? { id: parentId } : undefined,
      },
      startTrialDate: addSeconds(new Date(0), Math.floor(Date.now() / 1000)),
    },
  });

  return createTeam;
};
