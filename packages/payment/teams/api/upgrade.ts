import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { z } from "zod";

import { getRequestedSlugError } from "@quillsocial/app-store/stripepayment/lib/team-billing";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import {
  sendToJuneSo,
  TrackEventJuneSo,
  EVENTS,
} from "@quillsocial/features/june.so/juneso";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { HttpError } from "@quillsocial/lib/http-error";
import { defaultHandler, defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import {
  BillingPaymentStatus,
  BillingStatus,
  BillingType,
} from "@quillsocial/prisma/enums";
import { teamMetadataSchema } from "@quillsocial/prisma/zod-utils";

import stripe from "../../server/stripe";

const querySchema = z.object({
  user: z.string().transform((val) => parseInt(val)),
  session_id: z.string().min(1),
  user_id: z.string().transform((val) => parseInt(val)),
  billing_type: z.nativeEnum(BillingType),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    user: teamId,
    session_id,
    user_id,
    billing_type,
  } = querySchema.parse(req.query); //query string in format {user,session_id!}

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["subscription"],
  });
  if (!checkoutSession)
    throw new HttpError({
      statusCode: 404,
      message: "Checkout session not found",
    });

  const subscription = checkoutSession.subscription
    ? (checkoutSession.subscription as Stripe.Subscription)
    : null;
  if (checkoutSession?.payment_status !== "paid")
    throw new HttpError({ statusCode: 402, message: "Payment required" });

  /* Check if a team was already upgraded with this payment intent */
  let team = await prisma.team.findFirst({
    where: { metadata: { path: ["paymentId"], equals: checkoutSession.id } },
  });
  const subscriptionItemId =
    subscription?.items?.data && subscription?.items?.data?.length > 0
      ? subscription?.items?.data[0].id
      : null;
  if (!team) {
    const prevTeam = await prisma.team.findFirstOrThrow({
      where: { id: teamId },
    });
    const metadata = teamMetadataSchema.parse(prevTeam.metadata);
    /** We save the metadata first to prevent duplicate payments */
    team = await prisma.team.update({
      where: { id: teamId },
      data: {
        metadata: {
          paymentId: checkoutSession.id,
          subscriptionId: subscription?.id || null,
          subscriptionItemId,
        },
      },
    });
    /** Legacy teams already have a slug, this will allow them to upgrade as well */
    const slug = prevTeam.slug || metadata?.requestedSlug;
    if (slug) {
      try {
        /** Then we try to upgrade the slug, which may fail if a conflict came up since team creation */
        team = await prisma.team.update({
          where: { id: teamId },
          data: { slug },
        });
      } catch (error) {
        const { message, statusCode } = getRequestedSlugError(error, slug);
        return res.status(statusCode).json({ message });
      }
    }
  }
  let quantity = 1;
  if (
    checkoutSession.subscription &&
    typeof checkoutSession.subscription === "object" &&
    checkoutSession.subscription !== null
  ) {
    quantity =
      checkoutSession.subscription.items &&
      checkoutSession.subscription.items.data.length > 0
        ? checkoutSession.subscription.items.data[0].quantity ?? 1
        : 1;
  }

  const createBill = await prisma.billing.create({
    data: {
      type: billing_type,
      // updatedBy: user_id,
      teamId,
      status: BillingStatus.ACTIVE,
      paymentStatus: BillingPaymentStatus.PAID,
      quantity: billing_type == BillingType.PER_USER ? quantity : 1,
      paymentId: checkoutSession.id,
      subscriptionId: subscription?.id || null,
      subscriptionItemId,
      paymentData: JSON.stringify(checkoutSession),
    },
  });

  if (createBill) {
    const members = await prisma.membership.findMany({
      where: {
        teamId: teamId,
      },
      select: {
        userId: true,
      },
    });

    const subscriptionDate = createBill
      ? Math.floor(new Date(createBill!.createdAt!).getTime() / 1000)
      : null;

    if (members) {
      for (const member of members) {
        TrackEventJuneSo({
          id: member.userId.toString(),
          event: EVENTS.PLAN_SUBSCRIBED,
        });
      }
    }
  }

  const session = await getServerSession({ req, res });

  if (!session) return { message: "Team upgraded successfully" };

  // redirect to team screen
  // res.redirect(302, `${WEBAPP_URL}/billing/overview`);
  res.redirect(302, `${WEBAPP_URL}/billing/success`);
}

export default defaultHandler({
  GET: Promise.resolve({ default: defaultResponder(handler) }),
});
