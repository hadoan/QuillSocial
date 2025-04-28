// import { deleteStripeCustomer } from "@quillsocial/app-store/stripepayment/lib/customer";
import { ErrorCode } from "@quillsocial/features/auth/lib/ErrorCode";
import { verifyPassword } from "@quillsocial/features/auth/lib/verifyPassword";
import { symmetricDecrypt } from "@quillsocial/lib/crypto";
import { prisma } from "@quillsocial/prisma";
import { IdentityProvider } from "@quillsocial/prisma/enums";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import { authenticator } from "otplib";

import type { TDeleteMeInputSchema } from "./deleteMe.schema";

type DeleteMeOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TDeleteMeInputSchema;
};

export const deleteMeHandler = async ({ ctx, input }: DeleteMeOptions) => {
  // Check if input.password is correct
  const user = await prisma.user.findUnique({
    where: {
      email: ctx.user.email.toLowerCase(),
    },
  });
  if (!user) {
    throw new Error(ErrorCode.UserNotFound);
  }

  if (user.identityProvider !== IdentityProvider.DB) {
    throw new Error(ErrorCode.ThirdPartyIdentityProviderEnabled);
  }

  if (!user.password) {
    throw new Error(ErrorCode.UserMissingPassword);
  }

  const isCorrectPassword = await verifyPassword(input.password, user.password);
  if (!isCorrectPassword) {
    throw new Error(ErrorCode.IncorrectPassword);
  }

  if (user.twoFactorEnabled) {
    if (!input.totpCode) {
      throw new Error(ErrorCode.SecondFactorRequired);
    }

    if (!user.twoFactorSecret) {
      console.error(
        `Two factor is enabled for user ${user.id} but they have no secret`
      );
      throw new Error(ErrorCode.InternalServerError);
    }

    if (!process.env.MY_APP_ENCRYPTION_KEY) {
      console.error(
        `"Missing encryption key; cannot proceed with two factor login."`
      );
      throw new Error(ErrorCode.InternalServerError);
    }

    const secret = symmetricDecrypt(
      user.twoFactorSecret,
      process.env.MY_APP_ENCRYPTION_KEY
    );
    if (secret.length !== 32) {
      console.error(
        `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`
      );
      throw new Error(ErrorCode.InternalServerError);
    }

    // If user has 2fa enabled, check if input.totpCode is correct
    const isValidToken = authenticator.check(input.totpCode, secret);
    if (!isValidToken) {
      throw new Error(ErrorCode.IncorrectTwoFactorCode);
    }
  }

  // If 2FA is disabled or totpCode is valid then delete the user from stripe and database
  // await deleteStripeCustomer(user).catch(console.warn);
  // Remove my account
  const deletedUser = await prisma.user.delete({
    where: {
      id: ctx.user.id,
    },
  });

  return;
};
