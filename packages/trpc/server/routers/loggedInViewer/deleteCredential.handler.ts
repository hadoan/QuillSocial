import { prisma } from "@quillsocial/prisma";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

import { TRPCError } from "@trpc/server";

import type { TDeleteCredentialInputSchema } from "./deleteCredential.schema";

type DeleteCredentialOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TDeleteCredentialInputSchema;
};

export const deleteCredentialHandler = async ({
  ctx,
  input,
}: DeleteCredentialOptions) => {
  const { id, externalId } = input;

  const credential = await prisma.credential.findFirst({
    where: {
      id: id,
      userId: ctx.user.id,
    },
    select: {
      key: true,
      appId: true,
      app: {
        select: {
          slug: true,
          categories: true,
          dirName: true,
        },
      },
    },
  });

  if (!credential) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  // if zapier get disconnected, delete zapier apiKey, delete zapier webhooks and cancel all scheduled jobs from zapier
  if (credential.app?.slug === "zapier") {
    await prisma.apiKey.deleteMany({
      where: {
        userId: ctx.user.id,
        appId: "zapier",
      },
    });
    await prisma.webhook.deleteMany({
      where: {
        userId: ctx.user.id,
        appId: "zapier",
      },
    });

    // for (const booking of bookingsWithScheduledJobs) {
    //   cancelScheduledJobs(booking, credential.appId);
    // }
  }

  // delete page info
  await prisma.pageInfo.deleteMany({
    where: {
      credentialId: id,
    },
  });

  // Validated that credential is user's above
  await prisma.credential.delete({
    where: {
      id: id,
    },
  });
};
