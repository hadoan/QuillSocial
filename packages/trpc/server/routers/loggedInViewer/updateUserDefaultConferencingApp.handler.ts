import getApps from "@quillsocial/app-store/utils";
import { prisma } from "@quillsocial/prisma";
import { userMetadata } from "@quillsocial/prisma/zod-utils";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import z from "zod";

import { TRPCError } from "@trpc/server";

import type { TUpdateUserDefaultConferencingAppInputSchema } from "./updateUserDefaultConferencingApp.schema";

type UpdateUserDefaultConferencingAppOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TUpdateUserDefaultConferencingAppInputSchema;
};

export const updateUserDefaultConferencingAppHandler = async ({
  ctx,
  input,
}: UpdateUserDefaultConferencingAppOptions) => {
  const currentMetadata = userMetadata.parse(ctx.user.metadata);
  const credentials = ctx.user.credentials;
  const foundApp = getApps(credentials).filter(
    (app) => app.slug === input.appSlug
  )[0];
  const appLocation = foundApp?.appData?.location;

  if (!foundApp || !appLocation)
    throw new TRPCError({ code: "BAD_REQUEST", message: "App not installed" });

  if (appLocation.linkType === "static" && !input.appLink) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "App link is required",
    });
  }

  if (appLocation.linkType === "static" && appLocation.urlRegExp) {
    const validLink = z
      .string()
      .regex(new RegExp(appLocation.urlRegExp), "Invalid App Link")
      .parse(input.appLink);
    if (!validLink) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid app link" });
    }
  }

  await prisma.user.update({
    where: {
      id: ctx.user.id,
    },
    data: {
      metadata: {
        ...currentMetadata,
        defaultConferencingApp: {
          appSlug: input.appSlug,
          appLink: input.appLink,
        },
      },
    },
  });
  return input;
};
