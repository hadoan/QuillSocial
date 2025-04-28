import stripe from "@quillsocial/app-store/stripepayment/lib/server";
import { IS_PRODUCTION } from "@quillsocial/lib/constants";
import { getErrorFromUnknown } from "@quillsocial/lib/errors";
import { HttpError as HttpCode } from "@quillsocial/lib/http-error";
import { prisma } from "@quillsocial/prisma";
import { BillingPaymentStatus, BillingStatus } from "@quillsocial/prisma/enums";
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handleCustomerSubscriptionDeleted = async (event: Stripe.Event) => {
  const sub = event.data.object as Stripe.Subscription;
  const subscriptionId = sub.id;
  let billings = await prisma.billing.findMany({
    where: {
      subscriptionId,
    },
  });

  if (billings) {
    const billingIds = billings.map((x) => x.id);
    await prisma.billing.updateMany({
      where: {
        id: {
          in: billingIds,
        },
      },
      data: {
        status: BillingStatus.INACTIVE,
        paymentStatus: BillingPaymentStatus.UNKNOWN,
      },
    });
  }
};

type WebhookHandler = (event: Stripe.Event) => Promise<void>;

const webhookHandlers: Record<string, WebhookHandler | undefined> = {
  // "payment_intent.succeeded": handlePaymentSuccess,
  // "setup_intent.succeeded": handleSetupSuccess,
  "customer.subscription.deleted": handleCustomerSubscriptionDeleted,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      throw new HttpCode({ statusCode: 405, message: "Method Not Allowed" });
    }
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      throw new HttpCode({
        statusCode: 400,
        message: "Missing stripe-signature",
      });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new HttpCode({
        statusCode: 500,
        message: "Missing process.env.STRIPE_WEBHOOK_SECRET",
      });
    }
    const requestBuffer = await buffer(req);
    const payload = requestBuffer.toString();

    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (!event.account && event.type != "customer.subscription.deleted") {
      throw new HttpCode({
        statusCode: 202,
        message: "Incoming connected account",
      });
    }

    const handler = webhookHandlers[event.type];
    if (handler) {
      await handler(event);
    } else {
      /** Not really an error, just letting Stripe know that the webhook was received but unhandled */
      throw new HttpCode({
        statusCode: 202,
        message: `Unhandled Stripe Webhook event type ${event.type}`,
      });
    }
  } catch (_err) {
    const err = getErrorFromUnknown(_err);
    console.error(`Webhook Error: ${err.message}`);
    res.status(err.statusCode ?? 500).send({
      message: err.message,
      stack: IS_PRODUCTION ? undefined : err.stack,
    });
    return;
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
}
