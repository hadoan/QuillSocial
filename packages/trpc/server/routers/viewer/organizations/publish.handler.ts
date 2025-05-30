// import { getRequestedSlugError } from "@quillsocial/app-store/stripepayment/lib/team-billing";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { isOrganisationAdmin } from "@quillsocial/lib/server/queries/organisations";
import { prisma } from "@quillsocial/prisma";
import { teamMetadataSchema } from "@quillsocial/prisma/zod-utils";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../trpc";

type PublishOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const publishHandler = async ({ ctx }: PublishOptions) => {
  const orgId = ctx.user.organizationId;
  if (!orgId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have an organization to upgrade",
    });

  if (!(await isOrganisationAdmin(ctx.user.id, orgId)))
    throw new TRPCError({ code: "UNAUTHORIZED" });

  const prevTeam = await prisma.team.findFirst({
    where: {
      id: orgId,
    },
    include: { members: true },
  });

  if (!prevTeam)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found.",
    });

  const metadata = teamMetadataSchema.safeParse(prevTeam.metadata);
  if (!metadata.success)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid team metadata",
    });

  // Since this is an ORG we need to make sure ORG members are scyned with the team. Every time a user is added to the TEAM, we need to add them to the ORG
  // if (IS_TEAM_BILLING_ENABLED) {
  //   const checkoutSession = await purchaseTeamSubscription({
  //     teamId: prevTeam.id,
  //     seats: prevTeam.members.length,
  //     userId: ctx.user.id,
  //     isOrg: true,
  //   });
  //   if (!checkoutSession.url)
  //     throw new TRPCError({
  //       code: "INTERNAL_SERVER_ERROR",
  //       message: "Failed retrieving a checkout session URL.",
  //     });
  //   return { url: checkoutSession.url, message: "Payment required to publish organization" };
  // }

  if (!metadata.data?.requestedSlug) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Can't publish organization without `requestedSlug`",
    });
  }

  const { requestedSlug, ...newMetadata } = metadata.data;
  let updatedTeam: Awaited<ReturnType<typeof prisma.team.update>>;

  try {
    updatedTeam = await prisma.team.update({
      where: { id: orgId },
      data: {
        slug: requestedSlug,
        metadata: { ...newMetadata },
      },
    });
  } catch (error) {
    // const { message } = getRequestedSlugError(error, requestedSlug);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "ERROR" });
  }

  return {
    url: `${WEBAPP_URL}/settings/organization/profile`,
    message: "Team published successfully",
  };
};
