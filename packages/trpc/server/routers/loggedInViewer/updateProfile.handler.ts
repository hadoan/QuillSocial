import type { TUpdateProfileInputSchema } from "./updateProfile.schema";
import type { Prisma } from "@prisma/client";
import { getTranslation } from "@quillsocial/lib/server";
import { checkUsername } from "@quillsocial/lib/server/checkUsername";
import { resizeBase64Image } from "@quillsocial/lib/server/resizeBase64Image";
import slugify from "@quillsocial/lib/slugify";
import { prisma } from "@quillsocial/prisma";
import { userMetadata } from "@quillsocial/prisma/zod-utils";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import { TRPCError } from "@trpc/server";
import type { NextApiResponse, GetServerSidePropsContext } from "next";

type UpdateProfileOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    res?: NextApiResponse | GetServerSidePropsContext["res"];
  };
  input: TUpdateProfileInputSchema;
};

export const updateProfileHandler = async ({
  ctx,
  input,
}: UpdateProfileOptions) => {
  const { user } = ctx;
  const data: Prisma.UserUpdateInput = {
    ...input,
    metadata: input.metadata as Prisma.InputJsonValue,
  };
  let isPremiumUsername = false;

  if (input.username && !user.organizationId) {
    const username = slugify(input.username);
    // Only validate if we're changing usernames
    if (username !== user.username) {
      data.username = username;
      const response = await checkUsername(username);
      isPremiumUsername = response.premium;
      if (!response.available) {
        throw new TRPCError({ code: "BAD_REQUEST", message: response.message });
      }
    }
  }
  if (input.avatar) {
    data.avatar = await resizeBase64Image(input.avatar);
  }
  const userToUpdate = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!userToUpdate) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }
  const metadata = userMetadata.parse(userToUpdate.metadata);

  const isPremium = metadata?.isPremium;
  if (isPremiumUsername) {
    // const stripeCustomerId = metadata?.stripeCustomerId;
    // if (!isPremium || !stripeCustomerId) {
    //   throw new TRPCError({ code: "BAD_REQUEST", message: "User is not premium" });
    // }
    // const stripeSubscriptions = await stripe.subscriptions.list({ customer: stripeCustomerId });
    // if (!stripeSubscriptions || !stripeSubscriptions.data.length) {
    //   throw new TRPCError({
    //     code: "INTERNAL_SERVER_ERROR",
    //     message: "No stripeSubscription found",
    //   });
    // }
    // Iterate over subscriptions and look for premium product id and status active
    // @TODO: iterate if stripeSubscriptions.hasMore is true
    // const isPremiumUsernameSubscriptionActive = stripeSubscriptions.data.some(
    //   (subscription) =>
    //     subscription.items.data[0].price.product === getPremiumPlanProductId() &&
    //     subscription.status === "active"
    // );
    // if (!isPremiumUsernameSubscriptionActive) {
    //   throw new TRPCError({
    //     code: "BAD_REQUEST",
    //     message: "You need to pay for premium username",
    //   });
    // }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      metadata: true,
      name: true,
      createdDate: true,
    },
  });

  return input;
};
