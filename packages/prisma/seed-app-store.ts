/**
 * @deprecated
 * This file is deprecated. The only use of this file is to seed the database for E2E tests. Each test should take care of seeding it's own data going forward.
 */
import prisma from ".";
import { AppCategories } from "./enums";
import type { Prisma } from "@prisma/client";
import { appStoreMetadata } from "@quillsocial/app-store/appStoreMetaData";
import {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  TIKTOK_CLIENT_ID,
  TIKTOK_CLIENT_SECRET,
} from "@quillsocial/lib/constants";
import dotEnv from "dotenv";

dotEnv.config({ path: "../../.env" });

async function createApp(
  /** The App identifier in the DB also used for public page in `/apps/[slug]` */
  slug: Prisma.AppCreateInput["slug"],
  /** The directory name for `/packages/app-store/[dirName]` */
  dirName: Prisma.AppCreateInput["dirName"],
  categories: Prisma.AppCreateInput["categories"],
  /** This is used so credentials gets linked to the correct app */
  type: Prisma.CredentialCreateInput["type"],
  keys?: Prisma.AppCreateInput["keys"],
  isTemplate?: boolean
) {
  try {
    const foundApp = await prisma.app.findFirst({
      /**
       * slug and dirName both are unique and any of them can be used to find the app uniquely
       * Using both here allows us to rename(after the app has been seeded already) `slug` or `dirName` while still finding the app to apply the change on.
       * Note: dirName is legacy and it is same as slug for all apps created through App-Store Cli.
       * - Take the case there was an app with slug `myvideo` and dirName `dirName-1` and that got seeded. Now, someone wants to rename the slug to `my-video`(more readable) for the app keeping dirName same.
       *    This would make this fn to be called with slug `my-video` and dirName `dirName-1`.
       *    Now, we can find the app because dirName would still match.
       * - Similar, if someone changes dirName keeping slug same, we can find the app because slug would still match.
       * - If both dirName and slug are changed, it will be added as a new entry in the DB.
       */
      where: {
        OR: [
          {
            slug,
          },
          {
            dirName,
          },
        ],
      },
    });

    // We need to enable seeded apps as they are used in tests.
    const data = { slug, dirName, categories, keys, enabled: true };

    if (!foundApp) {
      await prisma.app.create({
        data,
      });
      console.log(`📲 Created ${isTemplate ? "template" : "app"}: '${slug}'`);
    } else {
      // We know that the app exists, so either it would have the same slug or dirName
      // Because update query can't have both slug and dirName, try to find the app to update by slug and dirName one by one
      // if there would have been a unique App.uuid, that never changes, we could have used that in update query.
      await prisma.app.update({
        where: { slug: foundApp.slug },
        data,
      });
      await prisma.app.update({
        where: { dirName: foundApp.dirName },
        data,
      });
      console.log(`📲 Updated ${isTemplate ? "template" : "app"}: '${slug}'`);
    }

    await prisma.credential.updateMany({
      // Credential should stop using type and instead use an App.uuid to refer to app deterministically. That uuid would never change even if slug/dirName changes.
      // This would allow credentials to be not orphaned when slug(appId) changes.
      where: { type },
      data: { appId: slug },
    });
  } catch (e) {
    console.log(`Could not upsert app: ${slug}. Error:`, e);
  }
}

export default async function main() {
  await createApp(
    "instagram-social",
    "instagram_social",
    ["social"],
    "instagram_social",
    {
      app_id: process.env.INSTAGRAM_APP_ID,
      app_secret: process.env.INSTAGRAM_APP_SECRET
    }
  );
  return;
  await createApp(
    "threads-social",
    "threadssocial",
    ["social"],
    "threads_social",
    {
      app_id: process.env.THREADS_APP_ID,
      app_secret: process.env.THREADS_APP_SECRET,
    }
  );
  await createApp(
    "xconsumerkeys-social",
    "xconsumerkeyssocial",
    ["social"],
    "xconsumerkeys-social"
  );
  await createApp("chatgpt-ai", "chatgptai", ["social"], "chatgpt-ai");
  await createApp("x-social", "xsocial", ["social"], "x_social", {
    client_id: process.env.TWITTER_API_KEY,
    client_secret: process.env.TWITTER_API_SECRET,
  });
  await createApp(
    "facebook-social",
    "facebooksocial",
    ["social"],
    "facebook_social",
    {
      app_id: process.env.FACEBOOK_APP_ID,
      app_secret: process.env.FACEBOOK_APP_SECRET,
    }
  );

  await createApp(
    "linkedin-social",
    "linkedinsocial",
    ["social"],
    "linkedin_social",
    {
      app_id: LINKEDIN_CLIENT_ID,
      app_secret: LINKEDIN_CLIENT_SECRET,
    }
  );

  await createApp(
    "tiktok-social",
    "tiktoksocial",
    ["social"],
    "tiktok_social",
    {
      app_id: TIKTOK_CLIENT_ID,
      app_secret: TIKTOK_CLIENT_SECRET,
    }
  );

  try {
    const { client_secret, client_id, redirect_uris } = JSON.parse(
      process.env.GOOGLE_API_CREDENTIALS || ""
    ).web;
    await createApp(
      "medium-social",
      "mediumsocial",
      ["social"],
      "medium_social",
      {}
    );
    await createApp(
      "google-calendar",
      "googlecalendar",
      ["calendar"],
      "google_calendar",
      {
        client_id,
        client_secret,
        redirect_uris,
      }
    );
    await createApp(
      "googlemybusiness-social",
      "googlemybusiness",
      ["social"],
      "googlemybusiness_social",
      {
        client_id,
        client_secret,
        redirect_uris,
      }
    );
    await createApp("youtube-social", "youtube", ["social"], "youtube_social", {
      client_id,
      client_secret,
      redirect_uris,
    });
    await createApp(
      "google-meet",
      "googlevideo",
      ["conferencing"],
      "google_video",
      {
        client_id,
        client_secret,
        redirect_uris,
      }
    );
  } catch (e) {
    if (e instanceof Error)
      console.error("Error adding google credentials to DB:", e.message);
  }
  if (process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET) {
    await createApp(
      "office365-calendar",
      "office365calendar",
      ["calendar"],
      "office365_calendar",
      {
        client_id: process.env.MS_GRAPH_CLIENT_ID,
        client_secret: process.env.MS_GRAPH_CLIENT_SECRET,
      }
    );
    await createApp(
      "msteams",
      "office365video",
      ["conferencing"],
      "office365_video",
      {
        client_id: process.env.MS_GRAPH_CLIENT_ID,
        client_secret: process.env.MS_GRAPH_CLIENT_SECRET,
      }
    );
  }

  if (process.env.VITAL_API_KEY && process.env.VITAL_WEBHOOK_SECRET) {
    await createApp(
      "vital-automation",
      "vital",
      ["automation"],
      "vital_other",
      {
        mode: process.env.VITAL_DEVELOPMENT_MODE || "sandbox",
        region: process.env.VITAL_REGION || "us",
        api_key: process.env.VITAL_API_KEY,
        webhook_secret: process.env.VITAL_WEBHOOK_SECRET,
      }
    );
  }

  if (process.env.ZAPIER_INVITE_LINK) {
    await createApp("zapier", "zapier", ["automation"], "zapier_automation", {
      invite_link: process.env.ZAPIER_INVITE_LINK,
    });
  }

  // Payment apps
  if (
    process.env.STRIPE_CLIENT_ID &&
    process.env.STRIPE_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.PAYMENT_FEE_FIXED &&
    process.env.PAYMENT_FEE_PERCENTAGE
  ) {
    await createApp("stripe", "stripepayment", ["payment"], "stripe_payment", {
      client_id: process.env.STRIPE_CLIENT_ID,
      client_secret: process.env.STRIPE_PRIVATE_KEY,
      payment_fee_fixed: Number(process.env.PAYMENT_FEE_FIXED),
      payment_fee_percentage: Number(process.env.PAYMENT_FEE_PERCENTAGE),
      public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }

  for (const [, app] of Object.entries(appStoreMetadata)) {
    if (app.isTemplate && process.argv[2] !== "seed-templates") {
      continue;
    }

    const validatedCategories = app.categories.filter(
      (category): category is AppCategories => category in AppCategories
    );

    await createApp(
      app.slug,
      app.dirName ?? app.slug,
      validatedCategories,
      app.type,
      undefined,
      app.isTemplate
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
