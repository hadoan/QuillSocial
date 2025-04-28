import { prisma } from "@quillsocial/prisma";

import type { TrpcSessionUser } from "../../../trpc";

type CheckForAIAppsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const checkForAIApps = async ({ ctx }: CheckForAIAppsOptions) => {
  const chatGptPresent = await prisma.credential.findFirst({
    where: {
      type: "chatgpt_ai",
      userId: ctx.user.id,
    },
  });
  return !!chatGptPresent;
};
