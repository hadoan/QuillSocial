import type { TrpcSessionUser } from "../../../trpc";
import type { TDeleteInputSchema } from "./delete.schema";
import {
  IS_PRODUCTION,
  IS_TEAM_BILLING_ENABLED,
} from "@quillsocial/lib/constants";
import { isTeamOwner } from "@quillsocial/lib/server/queries/teams";
import { prisma } from "@quillsocial/prisma";
import { teamMetadataSchema } from "@quillsocial/prisma/zod-utils";
import { TRPCError } from "@trpc/server";

type DeleteOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TDeleteInputSchema;
};

const deleteVercelDomain = async ({
  slug,
  isOrganization,
}: {
  slug?: string | null;
  isOrganization?: boolean | null;
}) => {
  if (!isOrganization || !slug) {
    return false;
  }

  const fullDomain = `${slug}`;
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${fullDomain}?teamId=${process.env.TEAM_ID_VERCEL}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN_VERCEL}`,
      },
      method: "DELETE",
    }
  );

  const data = await response.json();

  // Domain is already owned by another team but you can request delegation to quillsocial it
  if (data.error?.code === "forbidden")
    throw new TRPCError({ code: "CONFLICT", message: "domain_taken_team" });

  // Domain is already being used by a different project
  if (data.error?.code === "domain_taken")
    throw new TRPCError({ code: "CONFLICT", message: "domain_taken_project" });

  return true;
};

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  if (!(await isTeamOwner(ctx.user?.id, input.teamId)))
    throw new TRPCError({ code: "UNAUTHORIZED" });

  // if (IS_TEAM_BILLING_ENABLED) await cancelTeamSubscriptionFromStripe(input.teamId);

  // delete all memberships
  await prisma.membership.deleteMany({
    where: {
      teamId: input.teamId,
    },
  });

  const deletedTeam = await prisma.team.delete({
    where: {
      id: input.teamId,
    },
  });

  const deletedTeamMetadata = teamMetadataSchema.parse(deletedTeam.metadata);

  if (IS_PRODUCTION)
    deleteVercelDomain({
      slug: deletedTeam.slug,
      isOrganization: deletedTeamMetadata?.isOrganization,
    });
};
