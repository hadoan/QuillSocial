import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { instagramCredentialSchema } from "../lib/instagramCredentialSchema";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

let app_id = "";
let app_secret = "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;
  if (code && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }
  if (!req.session?.user?.id) {
    return res
      .status(401)
      .json({ message: "You must be logged in to do this" });
  }
  const userId = req.session.user.id;

  const appKeys = await getAppKeysFromSlug("instagram-social");
  if (typeof appKeys.app_id === "string") app_id = appKeys.app_id;
  if (typeof appKeys.app_secret === "string") app_secret = appKeys.app_secret;
  if (!app_id)
    return res.status(400).json({ message: "Instagram app_id missing." });
  if (!app_secret)
    return res.status(400).json({ message: "Instagram app_secret missing." });

  // Build a redirect URI that matches where the OAuth flow started.
  // For local development Facebook/Instagram will redirect to http://localhost:3000,
  // whereas WEBAPP_URL may point to production. Attempt to derive the scheme+host
  // from the incoming request so the code exchange uses the exact redirect URI.
  function buildRedirectUri(req: NextApiRequest) {
    const host = req.headers.host;
    if (!host) return WEBAPP_URL + "/api/integrations/instagramsocial/callback";
    const forwardedProto = (req.headers["x-forwarded-proto"] as string) || "";
    const protoFromForward = forwardedProto.split(",")[0];
    // If forwarded proto exists use it, otherwise if host looks like localhost use http,
    // else default to https.
    const proto =
      protoFromForward || (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}/api/integrations/instagramsocial/callback`;
  }

  const redirectUri = buildRedirectUri(req);

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    // Diagnostic info: log app id and redirectUri to help debug invalid app errors.
    // Do NOT log app_secret.
    console.info(
      "Instagram OAuth exchange: app_id=",
      app_id,
      "redirectUri=",
      redirectUri
    );

    // 1) Exchange code → Facebook User Access Token
    const { data: tokenData } = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          client_id: app_id,
          client_secret: app_secret,
          redirect_uri: redirectUri,
          code,
        },
      }
    );

    const userAccessToken = tokenData.access_token;

    // Exchange for long-lived token
    const { data: longLivedData } = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: app_id,
          client_secret: app_secret,
          fb_exchange_token: userAccessToken,
        },
      }
    );

    const { access_token: longLivedToken, expires_in } = longLivedData;

    // Check permissions
    const { data: permissionsResp } = await axios.get(
      `https://graph.facebook.com/v23.0/me/permissions`,
      {
        params: { access_token: longLivedToken }
      }
    );

    const permissionsData = permissionsResp?.data ?? [];
    const permissions = permissionsData
      .filter((d: any) => d.status === "granted")
      .map((p: any) => p.permission);

    const requiredScopes = [
      "instagram_basic",
      "pages_show_list",
      "pages_read_engagement",
      "instagram_content_publish",
      "instagram_manage_comments",
      "instagram_manage_insights",
    ];

    const missingScopes = requiredScopes.filter(
      (scope) => !permissions.includes(scope)
    );

    if (missingScopes.length > 0) {
      return res.status(400).json({
        message: `Missing required scopes: ${missingScopes.join(", ")}`,
      });
    }

    // Get user data for credential
    const { data: userData } = await axios.get(
      `https://graph.facebook.com/v23.0/me`,
      {
        params: {
          fields: "id,name,email,first_name,last_name,picture",
          access_token: longLivedToken
        }
      }
    );

    // Store or update the main credential
    const existedCredentials = await prisma.credential.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        emailOrUserName: true,
        appId: true,
        isUserCurrentProfile: true,
      },
    });

    const existed = existedCredentials?.find(
      (x) =>
        x.appId === "instagram-social" && x.emailOrUserName == userData?.email
    );

    const credentialId = existed?.id ?? 0;
    let isUserCurrentProfile: boolean | null =
      !existedCredentials || existedCredentials.length === 0 ? true : false;

    if (existed) {
      isUserCurrentProfile =
        existed.isUserCurrentProfile ?? isUserCurrentProfile;
    }

    const credentialData = {
      type: "instagram_social",
      key: { access_token: longLivedToken, expires_in },
      userId,
      appId: "instagram-social",
      avatarUrl: undefined, // Instagram does not allow links to be accessed from the browser
      name: userData?.name,
      emailOrUserName: userData?.email,
      isUserCurrentProfile,
    };

    const upsertedCredential = await prisma.credential.upsert({
      where: {
        id: credentialId,
      },
      create: {
        ...credentialData,
        isUserCurrentProfile,
      },
      update: credentialData,
    });

    // 2) List pages the user manages (each has a page access token)
    const { data: pagesData } = await axios.get(
      "https://graph.facebook.com/v23.0/me/accounts",
      {
        params: { access_token: longLivedToken }
      }
    );

    console.log(`📊 Found ${pagesData.data?.length ?? 0} Facebook Page(s)`);

    const instagramAccountUpserts: Promise<any>[] = [];
    const pageInfoUpserts: Promise<any>[] = [];

    // 3) For each Page, find connected IG account
    for (const page of pagesData.data ?? []) {
      const pageId = page.id as string;
      const pageToken = page.access_token as string;
      const pageName = page.name as string;

      try {
        // Fetch page details with Instagram account
        const { data: pageDetail } = await axios.get(
          `https://graph.facebook.com/v23.0/${pageId}`,
          {
            params: {
              access_token: pageToken,
              fields: "instagram_business_account,connected_instagram_account,name"
            }
          }
        );

        const igAccountId = pageDetail.instagram_business_account?.id
                         || pageDetail.connected_instagram_account?.id;

        if (!igAccountId) {
          console.log(`⚠️ Page "${pageName}" has no Instagram account linked`);
          continue;
        }

        // Fetch Instagram account details
        const { data: igDetail } = await axios.get(
          `https://graph.facebook.com/v23.0/${igAccountId}`,
          {
            params: {
              access_token: pageToken,
              fields: "id,username,name,profile_picture_url"
            }
          }
        );

        console.log(`✅ Found Instagram account: @${igDetail.username} (${igAccountId})`);

        // Upsert InstagramAccount record
        instagramAccountUpserts.push(
          prisma.instagramAccount.upsert({
            where: {
              userId_igUserId: { userId, igUserId: igAccountId }
            },
            update: {
              pageId,
              pageName: pageDetail.name ?? pageName,
              pageAccessToken: pageToken,
              igUsername: igDetail.username ?? null,
              credentialId: upsertedCredential.id,
            },
            create: {
              userId,
              credentialId: upsertedCredential.id,
              pageId,
              pageName: pageDetail.name ?? pageName,
              pageAccessToken: pageToken,
              igUserId: igAccountId,
              igUsername: igDetail.username ?? null,
            }
          })
        );

        // Also maintain PageInfo for backward compatibility with existing UI
        pageInfoUpserts.push(
          prisma.pageInfo.upsert({
            where: {
              credentialId_id: {
                credentialId: upsertedCredential.id,
                id: igAccountId,
              },
            },
            create: {
              id: igAccountId,
              name: igDetail.name || igDetail.username || pageName,
              credentialId: upsertedCredential.id,
              isCurrent: instagramAccountUpserts.length === 1,
              info: {
                id: igAccountId,
                name: igDetail.name,
                username: igDetail.username,
                profile_picture_url: igDetail.profile_picture_url,
                access_token: pageToken,
                pageId,
                pageName: pageDetail.name ?? pageName,
              },
            },
            update: {
              name: igDetail.name || igDetail.username || pageName,
              info: {
                id: igAccountId,
                name: igDetail.name,
                username: igDetail.username,
                profile_picture_url: igDetail.profile_picture_url,
                access_token: pageToken,
                pageId,
                pageName: pageDetail.name ?? pageName,
              },
            },
          })
        );
      } catch (error: any) {
        console.error(
          `❌ Failed to process page "${pageName}" (${pageId}):`,
          error.response?.data || error.message
        );
      }
    }

    // Execute all upserts in parallel
    await Promise.all([...instagramAccountUpserts, ...pageInfoUpserts]);

    console.log(`🎉 Successfully stored ${instagramAccountUpserts.length} Instagram account(s)`);

    res.redirect(
      getInstalledAppPath({ variant: "social", slug: "instagram-social" })
    );
  } catch (error: any) {
    // Surface the full response from Facebook/Instagram when possible to aid debugging.
    const fbData = error?.response?.data;
    console.error("Error exchanging code for token:", fbData || error.message);
    const message =
      fbData?.error?.message || fbData || error.message || "Unknown error";
    return res.status(500).send(`Error exchanging code for token: ${message}`);
  }
}
