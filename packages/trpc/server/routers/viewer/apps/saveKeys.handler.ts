import { appKeysSchemas } from "@quillsocial/app-store/apps.keys-schemas.generated";
import { getLocalAppMetadata } from "@quillsocial/app-store/utils";
import type { AppCategories } from "@quillsocial/prisma/enums";
import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

// import prisma from "@quillsocial/prisma";
import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../trpc";
import type { TSaveKeysInputSchema } from "./saveKeys.schema";

type SaveKeysOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    prisma: PrismaClient;
  };
  input: TSaveKeysInputSchema;
};

export const saveKeysHandler = async ({ ctx, input }: SaveKeysOptions) => {
  const keysSchema =
    appKeysSchemas[input.dirName as keyof typeof appKeysSchemas];
  const keys = keysSchema.parse(input.keys);

  // Get app name from metadata
  const localApps = getLocalAppMetadata();
  const appMetadata = localApps.find(
    (localApp) => localApp.slug === input.slug
  );

  if (!appMetadata?.dirName && appMetadata?.categories)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "App metadata could not be found",
    });

  await ctx.prisma.app.upsert({
    where: {
      slug: input.slug,
    },
    update: { keys, ...(input.fromEnabled && { enabled: true }) },
    create: {
      slug: input.slug,
      dirName: appMetadata?.dirName || appMetadata?.slug || "",
      categories:
        (appMetadata?.categories as AppCategories[]) ||
        ([appMetadata?.category] as AppCategories[]) ||
        undefined,
      keys: (input.keys as Prisma.InputJsonObject) || undefined,
      ...(input.fromEnabled && { enabled: true }),
    },
  });
};
