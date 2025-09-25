import type { TrpcSessionUser } from "../../../trpc";
import type { TSubscribeInputSchema } from "./subscribe.schema";
import { purchaseASubscription } from "@quillsocial/payment/lib/payments";
import { prisma } from "@quillsocial/prisma";
import {
  BillingStatus,
  BillingType,
  type PrismaClient,
} from "@quillsocial/prisma/client";
import { TRPCError } from "@trpc/server";

type SubscribeOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    prisma: PrismaClient;
  };
  input: TSubscribeInputSchema;
};

export const subscribeHandler = async ({ ctx, input }: SubscribeOptions) => {
  const { billingType } = input;
  const userId = ctx.user.id;
  const membership = await prisma?.membership.findFirst({
    where: {
      userId,
      role: {
        in: ["ADMIN", "OWNER"],
      },
    },
  });

  if (!membership) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Couldn't find team for this user, please go to Employee feature to manage your team.",
    });
  }

  const typeFilters: Record<typeof billingType, BillingType> = {
    freeTier: BillingType.FREE_TIER,
    ltd: BillingType.LTD,
    team: BillingType.TEAM,
    perUser: BillingType.PER_USER,
  };
  const hasBilling = await ctx.prisma.billing.findFirst({
    where: {
      teamId: membership.teamId,
      type: typeFilters[billingType],
      status: BillingStatus.ACTIVE,
    },
  });

  if (hasBilling && hasBilling.type != BillingType.PER_USER) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Your team already subsribed to this plan.",
    });
  }

  try {
    //handle payment
    // if payment needed, respond with checkout url

    const checkoutSession = await generateCheckoutSession({
      billingType: typeFilters[billingType],
      userId: ctx.user.id,
      teamId: membership.teamId,
    });
    if (checkoutSession) return checkoutSession;
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Error when make a payment to a subscription",
    });
  }
};

const generateCheckoutSession = async ({
  billingType,
  userId,
  teamId,
}: {
  billingType: BillingType;
  userId: number;
  teamId: number;
}) => {
  const checkoutSession = await purchaseASubscription({
    billingType,
    userId,
    teamId,
  });
  if (!checkoutSession.url)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed retrieving a checkout session URL.",
    });
  return { url: checkoutSession.url, message: "Payment required" };
};
