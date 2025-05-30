import { prisma } from "@quillsocial/prisma";

import type { TrpcSessionUser } from "../../../trpc";
import type { CheckGlobalKeysSchemaType } from "./checkGlobalKeys.schema";

type checkForGlobalKeys = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: CheckGlobalKeysSchemaType;
};

export const checkForGlobalKeysHandler = async ({
  ctx,
  input,
}: checkForGlobalKeys) => {
  const appIsGloballyInstalled = await prisma.app.findUnique({
    where: {
      slug: input.slug,
    },
  });

  return !!appIsGloballyInstalled;
};
