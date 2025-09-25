import stripe from "../../server/stripe";
import { getRequestedSlugError } from "@quillsocial/app-store/stripepayment/lib/team-billing";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
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
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { z } from "zod";

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

  const subscription = checkoutSession.subscription as Stripe.Subscription;
  if (checkoutSession.payment_status !== "paid")
    throw new HttpError({ statusCode: 402, message: "Payment required" });

  await prisma.billing.create({
    data: {
      type: billing_type,
      userId: user_id,
      status: BillingStatus.ACTIVE,
      paymentStatus: BillingPaymentStatus.PAID,
      quantity: 1,
      paymentId: checkoutSession.id,
      subscriptionId: subscription.id || null,
      subscriptionItemId: subscription.items.data[0].id || null,
    },
  });

  const session = await getServerSession({ req, res });

  if (!session) return { message: "Team upgraded successfully" };

  // redirect to team screen
  res.redirect(302, `${WEBAPP_URL}/billing/overview`);
}

export default defaultHandler({
  GET: Promise.resolve({ default: defaultResponder(handler) }),
});
