import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { isOrganisationAdmin } from "@quillsocial/lib/server/queries/organisations";
import { isTeamAdmin } from "@quillsocial/lib/server/queries/teams";
import { purchaseTeamSubscription } from "@quillsocial/payment/lib/payments";
import { prisma } from "@quillsocial/prisma";
import { teamMetadataSchema } from "@quillsocial/prisma/zod-utils";
import type { Prisma } from "@prisma/client";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../trpc";
import type { TPublishInputSchema } from "./publish.schema";

type PublishOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TPublishInputSchema;
};

const generateCheckoutSession = async ({
  teamId,
  seats,
  userId,
}: {
  teamId: number;
  seats: number;
  userId: number;
}) => {
  const checkoutSession = await purchaseTeamSubscription({
    teamId,
    seats,
    userId,
  });
  if (!checkoutSession.url)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed retrieving a checkout session URL.",
    });
  return { url: checkoutSession.url, message: "Payment required to publish team" };
};

const parseMetadataOrThrow = (metadata: Prisma.JsonValue) => {
  const parsedMetadata = teamMetadataSchema.safeParse(metadata);

  if (!parsedMetadata.success || !parsedMetadata.data)
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid team metadata" });
  return parsedMetadata.data;
};

const publishOrganizationTeamHandler = async ({ ctx, input }: PublishOptions) => {
  if (!ctx.user.organizationId) throw new TRPCError({ code: "UNAUTHORIZED" });

  if (!isOrganisationAdmin(ctx.user.id, ctx.user?.organizationId))
    throw new TRPCError({ code: "UNAUTHORIZED" });

  const createdTeam = await prisma.team.findFirst({
    where: { id: input.teamId, parentId: ctx.user.organizationId },
    include: {
      parent: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!createdTeam || !createdTeam.parentId)
    throw new TRPCError({ code: "NOT_FOUND", message: "Team not found." });

  const metadata = parseMetadataOrThrow(createdTeam.metadata);

  if (!metadata?.requestedSlug) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Can't publish team without `requestedSlug`" });
  }
  const { requestedSlug, ...newMetadata } = metadata;
  let updatedTeam: Awaited<ReturnType<typeof prisma.team.update>>;

  try {
    updatedTeam = await prisma.team.update({
      where: { id: createdTeam.id },
      data: {
        slug: requestedSlug,
        metadata: { ...newMetadata },
      },
    });
  } catch (error) {
    // throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", error });
    throw error;
  }

  return {
    url: `${WEBAPP_URL}/settings/teams/${updatedTeam.id}/profile`,
    message: "Team published successfully",
  };
};

export const publishHandler = async ({ ctx, input }: PublishOptions) => {
  if (ctx.user.organizationId) return publishOrganizationTeamHandler({ ctx, input });

  if (!(await isTeamAdmin(ctx.user.id, input.teamId))) throw new TRPCError({ code: "UNAUTHORIZED" });
  const { teamId: id } = input;

  const prevTeam = await prisma.team.findFirst({ where: { id }, include: { members: true } });

  if (!prevTeam) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found." });

  const metadata = parseMetadataOrThrow(prevTeam.metadata);

  // if payment needed, respond with checkout url
  const checkoutSession = await generateCheckoutSession({
    teamId: prevTeam.id,
    seats: prevTeam.members.length,
    userId: ctx.user.id,
  });

  if (checkoutSession) return checkoutSession;

  if (!metadata?.requestedSlug) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Can't publish team without `requestedSlug`" });
  }

  const { requestedSlug, ...newMetadata } = metadata;
  let updatedTeam: Awaited<ReturnType<typeof prisma.team.update>>;

  try {
    updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        slug: requestedSlug,
        metadata: { ...newMetadata },
      },
    });
  } catch (error) {
    // throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", error });
    throw error;
  }


  return {
    url: `${WEBAPP_URL}/settings/teams/${updatedTeam.id}/profile`,
    message: "Team published successfully",
  };
};
