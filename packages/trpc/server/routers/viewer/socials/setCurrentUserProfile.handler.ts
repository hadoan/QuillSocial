import type { TrpcSessionUser } from "../../../trpc";
import type { TCurrentUserProfileInputSchema } from "./setCurrentUserProfile.schema";
import { resetCachedSocialProfile } from "@quillsocial/features/auth/lib/socialProfiles";
import { prisma } from "@quillsocial/prisma";
import { TRPCError } from "@trpc/server";

type UpdateOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TCurrentUserProfileInputSchema;
};

export const setCurrentUserProfileHandler = async ({
  ctx,
  input,
}: UpdateOptions) => {
  if (!ctx.user.id)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid user`,
    });

  const setFalseMany = await prisma.credential.updateMany({
    where: {
      userId: ctx.user.id,
    },
    data: {
      isUserCurrentProfile: false,
      currentPageId: undefined,
    },
  });

  if (setFalseMany) {
    const update = await prisma.credential.update({
      where: {
        id: input.id,
      },
      data: {
        isUserCurrentProfile: true,
        currentPageId: input.pageId,
      },
    });
    await resetCachedSocialProfile(ctx.user.id);
    return update;
  }
  return false;
};
