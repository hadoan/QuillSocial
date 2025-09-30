import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { instagramCredentialSchema } from "../lib/instagramCredentialSchema";

let app_id = "";
let app_secret = "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (code && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }
  const userId = req.session.user.id;

  const appKeys = await getAppKeysFromSlug("instagram-social");
  if (typeof appKeys.app_id === "string") app_id = appKeys.app_id;
  if (typeof appKeys.app_secret === "string") app_secret = appKeys.app_secret;
  if (!app_id) return res.status(400).json({ message: "Instagram app_id missing." });
  if (!app_secret) return res.status(400).json({ message: "Instagram app_secret missing." });

  const redirectUri = WEBAPP_URL + "/api/integrations/instagramsocial/callback";

  let key: any = undefined;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }
  try {
    // Get initial access token
    const getAccessToken = await axios.post("https://graph.facebook.com/v20.0/oauth/access_token", null, {
      params: {
        client_id: app_id,
        client_secret: app_secret,
        redirect_uri: redirectUri,
        code,
      },
    });

    // Exchange for long-lived token
      const longLived = await axios.post("https://graph.facebook.com/v20.0/oauth/access_token", null, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: app_id,
          client_secret: app_secret,
          fb_exchange_token: getAccessToken.data.access_token,
        },
      });
  const { access_token, expires_in } = longLived.data;

    // Check permissions
    const permissionsResp = await axios.get(`https://graph.facebook.com/v20.0/me/permissions?access_token=${access_token}`);

    const permissions = permissionsResp.data
      .filter((d: any) => d.status === 'granted')
      .map((p: any) => p.permission);

    const requiredScopes = [
      'instagram_basic',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
    ];

    const missingScopes = requiredScopes.filter(scope => !permissions.includes(scope));
    if (missingScopes.length > 0) {
      return res.status(400).json({ message: `Missing required scopes: ${missingScopes.join(', ')}` });
    }

    key = { access_token, expires_in };
    const userData = await getUserData(access_token);
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
      (x) => x.appId === "instagram-social" && x.emailOrUserName == userData?.email
    );
    const id = existed?.id ?? 0;
    let isUserCurrentProfile: boolean | null =
      !existedCredentials || existedCredentials.length === 0 ? true : false;
    if (existed) {
      isUserCurrentProfile = existed.isUserCurrentProfile ?? isUserCurrentProfile;
    }

    const data = {
      type: "instagram_social",
      key,
  userId,
      appId: "instagram-social",
      // avatarUrl: userData?.picture?.data?.url, //Instagram does not allow links to be accessed from the browser
      avatarUrl: undefined, //Instagram does not allow links to be accessed from the browser
      name: userData?.name,
      emailOrUserName: userData?.email,
      isUserCurrentProfile,
    };

    const upsertedRecord = await prisma.credential.upsert({
      where: {
        id,
      },
      create: {
        ...data,
        isUserCurrentProfile,
      },
      update: data,
    });
    // Get Instagram business accounts through Facebook pages
    const pageInfoes = await getManagedPages(access_token);
  if (Array.isArray(pageInfoes) && pageInfoes.length > 0) {
      await Promise.all(
        pageInfoes.map(async (p) =>
          prisma.pageInfo.upsert({
            where: {
              credentialId_id: {
                credentialId: upsertedRecord.id,
                id: p.id,
              },
            },
            create: {
              ...p,
              credentialId: upsertedRecord.id,
              info: p.info,
            },
            update: {
              ...p,
              credentialId: upsertedRecord.id,
              info: p.info,
            },
          })
        )
      );
    }

    res.redirect(getInstalledAppPath({ variant: "social", slug: "instagram-social" }));
  } catch (error: any) {
    console.error("Error exchanging code for token:", error.message);
    return res.status(500).send("Error exchanging code for token");
  }
}

async function getProfilePictureUrl(userId: string, access_token: string) {
  try {
    const response = await axios.get(`https://graph.instagram.com/v19.0/${userId}/picture`, {
      params: {
        type: "normal", // You can specify 'small', 'normal', 'large', or 'square'
        access_token,
      },
      responseType: "json",
    });

    const pictureUrl = response.data.data.url;
    return pictureUrl;
  } catch (error: any) {
    console.error("Error fetching profile picture:", error.response?.data || error.message);
    return undefined;
  }
}

async function getUserData(accessToken: string) {
  const userUrl = `https://graph.facebook.com/v20.0/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`;
  const responseUser = await axios.get(userUrl);
  const userData = responseUser.data;
  return userData;
}

async function getManagedPages(accessToken: string): Promise<any[] | undefined> {
  try {
    // Get Facebook pages that have Instagram business accounts
    const { data } = await axios.get(
      `https://graph.facebook.com/v20.0/me/accounts?fields=id,instagram_business_account,username,name,picture.type(large)&access_token=${accessToken}&limit=500`
    );

    const onlyConnectedAccounts = await Promise.all(
      data
        .filter((f: any) => f.instagram_business_account)
        .map(async (p: any) => {
          const instagramInfo = await axios.get(
            `https://graph.facebook.com/v20.0/${p.instagram_business_account.id}?fields=name,profile_picture_url,username&access_token=${accessToken}`
          );

          // Get page access token
          const pageTokenInfo = await axios.get(
            `https://graph.facebook.com/v20.0/${p.id}?fields=access_token,name,picture.type(large)&access_token=${accessToken}`
          );

          return {
            pageId: p.id,
            id: p.instagram_business_account.id,
            name: instagramInfo.data.name,
            username: instagramInfo.data.username,
            profile_picture_url: instagramInfo.data.profile_picture_url,
            access_token: pageTokenInfo.data.access_token,
            info: {
              ...instagramInfo.data,
              access_token: pageTokenInfo.data.access_token,
              pageId: p.id,
            }
          };
        })
    );

    return onlyConnectedAccounts.map((p: any, index: number) => ({
      id: p.id,
      name: p.name,
      info: p.info,
      isCurrent: index === 0,
    }));
  } catch (error: any) {
    console.error("Error fetching managed pages:", error.response?.data || error.message);
    return undefined;
  }
}

// async function getAllPagesWithInstagram(
//   accessToken: string,
//   url = "https://graph.instagram.com/v19.0/me/accounts",
//   pages: any = []
// ) {
//   try {
//     const response = await axios.get(url, {
//       params: {
//         fields: "name,id,picture,access_token,instagram_business_account",
//         access_token: accessToken,
//       },
//     });

//     // Combine current response data with the previously fetched pages
//     const combinedPages = [...pages, ...response.data.data];

//     // Check if there are more pages to fetch (pagination)
//     if (response.data.paging && response.data.paging.next) {
//       // Recursively fetch the next page
//       return await getAllPagesWithInstagram(accessToken, response.data.paging.next, combinedPages);
//     } else {
//       // No more pages, return the full result
//       return combinedPages;
//     }
//   } catch (error: any) {
//     console.error("Error fetching pages:", error.response ? error.response.data : error.message);
//     throw error;
//   }
// }
