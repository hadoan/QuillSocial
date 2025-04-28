// import { deleteStripeCustomer } from "@quillsocial/app-store/stripepayment/lib/customer";
import { ErrorCode } from "@quillsocial/features/auth/lib/ErrorCode";
import { prisma } from "@quillsocial/prisma";
import { IdentityProvider } from "@quillsocial/prisma/enums";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

type DeleteMeWithoutPasswordOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const deleteMeWithoutPasswordHandler = async ({ ctx }: DeleteMeWithoutPasswordOptions) => {
  const user = await prisma.user.findUnique({
    where: {
      email: ctx.user.email.toLowerCase(),
    },
  });
  if (!user) {
    throw new Error(ErrorCode.UserNotFound);
  }

  if (user.identityProvider === IdentityProvider.DB) {
    throw new Error(ErrorCode.SocialIdentityProviderRequired);
  }

  if (user.twoFactorEnabled) {
    throw new Error(ErrorCode.SocialIdentityProviderRequired);
  }

  // Remove me from Stripe
  // await deleteStripeCustomer(user).catch(console.warn);

  // Remove my account
  const deletedUser = await prisma.user.delete({
    where: {
      id: ctx.user.id,
    },
  });

  return;
};
