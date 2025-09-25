import { getStripeCustomerIdFromUserId } from "@quillsocial/app-store/stripepayment/lib/customer";
import stripe from "@quillsocial/app-store/stripepayment/lib/server";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";
import { BillingStatus, BillingType } from "@quillsocial/prisma/enums";
import { teamMetadataSchema } from "@quillsocial/prisma/zod-utils";
import { z } from "zod";

const teamPaymentMetadataSchema = z.object({
  paymentId: z.string(),
  subscriptionId: z.string(),
  subscriptionItemId: z.string(),
});

/** Used to prevent double charges for the same team */
export const checkIfTeamPaymentRequired = async ({ teamId = -1 }) => {
  const team = await prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    select: { metadata: true },
  });
  const metadata = teamMetadataSchema.parse(team.metadata);
  /** If there's no paymentId, we need to pay this team */
  if (!metadata?.paymentId) return { url: null };
  if (metadata?.paymentId === "LTD") return { url: WEBAPP_URL };

  const checkoutSession = await stripe.checkout.sessions.retrieve(
    metadata.paymentId
  );
  /** If there's a pending session but it isn't paid, we need to pay this team */
  if (checkoutSession.payment_status !== "paid") return { url: null };
  /** If the session is already paid we return the upgrade URL so team is updated. */
  return {
    url: `${WEBAPP_URL}/api/teams/${teamId}/upgrade?session_id=${metadata.paymentId}`,
  };
};

export const purchaseASubscription = async (input: {
  billingType: BillingType;
  userId: number;
  teamId: number;
}) => {
  const { billingType, userId, teamId } = input;

  let minimum = 1;
  if (billingType === BillingType.PER_USER) {
    const membersCount = await prisma.membership.count({
      where: {
        teamId,
      },
    });
    const purchasedUsers = await prisma.billing.count({
      where: {
        teamId,
        status: BillingStatus.ACTIVE,
      },
    });

    minimum =
      membersCount - purchasedUsers > 0 ? membersCount - purchasedUsers : 1;
  }
  const customer = await getStripeCustomerIdFromUserId(userId);
  let price =
    billingType == BillingType.TEAM
      ? process.env.STRIPE_TEAM_MONTHLY_PRICE_ID
      : process.env.STRIPE_PER_USER_PRICE_ID;
  if (billingType == BillingType.LTD) {
    price = process.env.STRIPE_LTD_PRICE_ID;
  }
  const adjustable_quantity =
    billingType == BillingType.TEAM || billingType == BillingType.LTD
      ? {
          enabled: false,
        }
      : {
          enabled: true,
          minimum,
          maximum: 10000,
        };
  const subscription_data =
    billingType == BillingType.LTD
      ? {}
      : {
          subscription_data: {
            metadata: {
              userId,
            },
          },
        };
  const session = await stripe.checkout.sessions.create({
    customer,
    mode: billingType == BillingType.LTD ? "payment" : "subscription",
    allow_promotion_codes: true,
    success_url: `${WEBAPP_URL}/api/billings/${teamId}/upgrade?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&billing_type=${billingType}`,
    cancel_url: `${WEBAPP_URL}/billing/overview`,
    line_items: [
      {
        /** We only need to set the base price and we can upsell it directly on Stripe's checkout  */
        price: price,
        quantity: minimum,
        adjustable_quantity,
      },
    ],
    customer_update: {
      address: "auto",
    },
    automatic_tax: {
      enabled: true,
    },
    metadata: {
      userId,
    },
    ...subscription_data,
  });
  return { url: session.url };
};

export const purchaseTeamSubscription = async (input: {
  teamId: number;
  seats: number;
  userId: number;
  isOrg?: boolean;
}) => {
  const { teamId, seats, userId, isOrg } = input;
  const { url } = await checkIfTeamPaymentRequired({ teamId });
  if (url) return { url };
  // For orgs, enforce minimum of 30 seats
  const quantity = isOrg ? (seats < 30 ? 30 : seats) : seats;
  const customer = await getStripeCustomerIdFromUserId(userId);
  const session = await stripe.checkout.sessions.create({
    customer,
    mode: "subscription",
    allow_promotion_codes: true,
    success_url: `${WEBAPP_URL}/api/teams/${teamId}/upgrade?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${WEBAPP_URL}/settings/my-account/profile`,
    line_items: [
      {
        /** We only need to set the base price and we can upsell it directly on Stripe's checkout  */
        price: isOrg
          ? process.env.STRIPE_ORG_MONTHLY_PRICE_ID
          : process.env.STRIPE_TEAM_MONTHLY_PRICE_ID,
        quantity: quantity,
      },
    ],
    customer_update: {
      address: "auto",
    },
    automatic_tax: {
      enabled: true,
    },
    metadata: {
      teamId,
    },
    subscription_data: {
      metadata: {
        teamId,
      },
    },
  });
  return { url: session.url };
};

const getTeamWithPaymentMetadata = async (teamId: number) => {
  const team = await prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    select: { metadata: true, members: true },
  });
  const metadata = teamPaymentMetadataSchema.parse(team.metadata);
  return { ...team, metadata };
};

export const cancelTeamSubscriptionFromStripe = async (teamId: number) => {
  try {
    const team = await getTeamWithPaymentMetadata(teamId);
    const { subscriptionId } = team.metadata;
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    let message = "Unknown error on cancelTeamSubscriptionFromStripe";
    if (error instanceof Error) message = error.message;
    console.error(message);
  }
};

export const updateQuantitySubscriptionFromStripe = async (teamId: number) => {
  try {
    const { url } = await checkIfTeamPaymentRequired({ teamId });
    /**
     * If there's no pending checkout URL it means that this team has not been paid.
     * We cannot update the subscription yet, this will be handled on publish/checkout.
     **/
    if (!url) return;
    const team = await getTeamWithPaymentMetadata(teamId);
    const { subscriptionId, subscriptionItemId } = team.metadata;
    const membershipCount = team.members.length;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionQuantity = subscription.items.data.find(
      (sub) => sub.id === subscriptionItemId
    )?.quantity;
    if (!subscriptionQuantity) throw new Error("Subscription not found");

    if (membershipCount < subscriptionQuantity) {
      console.info(
        `Team ${teamId} has less members than seats, skipping updating subscription.`
      );
      return;
    }

    const newQuantity = membershipCount - subscriptionQuantity;

    await stripe.subscriptions.update(subscriptionId, {
      items: [
        { quantity: membershipCount + newQuantity, id: subscriptionItemId },
      ],
    });
    console.info(
      `Updated subscription ${subscriptionId} for team ${teamId} to ${team.members.length} seats.`
    );
  } catch (error) {
    let message = "Unknown error on updateQuantitySubscriptionFromStripe";
    if (error instanceof Error) message = error.message;
    console.error(message);
  }
};
