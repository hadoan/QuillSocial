import { prisma } from "@quillsocial/prisma";
import { teamMetadataSchema } from "@quillsocial/prisma/zod-utils";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

type VerifyCodeOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const getBrandHandler = async ({ ctx }: VerifyCodeOptions) => {
  const { user } = ctx;

  if (!user.organizationId) return null;

  const team = await prisma.team.findFirst({
    where: {
      id: user.organizationId,
    },
    select: {
      logo: true,
      name: true,
      slug: true,
      metadata: true,
    },
  });

  const metadata = teamMetadataSchema.parse(team?.metadata);
  const slug = (team?.slug || metadata?.requestedSlug) as string;

  return {
    ...team,
    metadata,
    slug,
    fullDomain: "",
    domainSuffix: "",
  };
};
