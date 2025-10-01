import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { facebookCredentialSchema } from "../lib/facebookCredentialSchema";
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

  const appKeys = await getAppKeysFromSlug("facebook-social");
  if (typeof appKeys.app_id === "string") app_id = appKeys.app_id;
  if (typeof appKeys.app_secret === "string") app_secret = appKeys.app_secret;
  if (!app_id)
    return res.status(400).json({ message: "Facebook app_id missing." });
  if (!app_secret)
    return res.status(400).json({ message: "Facebook app_secret missing." });

  const redirectUri = WEBAPP_URL + "/api/integrations/facebooksocial/callback";

  let key: any = undefined;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }
  try {
    const tokenResponse = await axios.get(
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
    key = tokenResponse?.data;
    const userData = await getUserData(key?.access_token);
    // const profileUrl = await getProfilePictureUrl(userData?.id, key.access_token);
    const existedCredentials = await prisma.credential.findMany({
      where: {
        userId: req.session.user.id,
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
        x.appId === "facebook-social" && x.emailOrUserName == userData?.email
    );
    const id = existed?.id ?? 0;
    let isUserCurrentProfile: boolean | null =
      !existedCredentials || existedCredentials.length === 0 ? true : false;
    if (existed) {
      isUserCurrentProfile = existed.isUserCurrentProfile;
    }

    const data = {
      type: "facebook_social",
      key,
      userId: req.session.user.id,
      appId: "facebook-social",
      // avatarUrl: userData?.picture?.data?.url, //Facebook does not allow links to be accessed from the browser
      avatarUrl: undefined, //Facebook does not allow links to be accessed from the browser
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
    // const pages = await getManagedPages(tokenResponse.data.access_token);
    const pageInfoes = await getManagedPages(tokenResponse.data.access_token);
    if (pageInfoes) {
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

    res.redirect(
      getInstalledAppPath({ variant: "social", slug: "facebook-social" })
    );
  } catch (error: any) {
    console.error("Error exchanging code for token:", error.message);
    return res.status(500).send("Error exchanging code for token");
  }
}

async function getProfilePictureUrl(userId: string, access_token: string) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${userId}/picture`,
      {
        params: {
          type: "normal", // You can specify 'small', 'normal', 'large', or 'square'
          access_token,
        },
        responseType: "json",
      }
    );

    const pictureUrl = response.data.data.url;
    return pictureUrl;
  } catch (error: any) {
    console.error(
      "Error fetching profile picture:",
      error.response?.data || error.message
    );
    return undefined;
  }
}

async function getUserData(accessToken: string) {
  const userUrl = `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name&access_token=${accessToken}`;
  const responseUser = await axios.get(userUrl);
  const userData = responseUser.data;
  return userData;
}

async function getAllPages(
  accessToken: string,
  url = "https://graph.facebook.com/v21.0/me/accounts",
  pages: any[] = []
): Promise<any[]> {
  try {
    const response = await axios.get(url, {
      params: {
        // Include instagram_business_account so we can detect connected IG business accounts
        fields: "name,id,picture,access_token,instagram_business_account",
        access_token: accessToken,
      },
    });

    // Combine current response data with the previously fetched pages
    const combinedPages = [...pages, ...response.data.data];

    // Check if there are more pages to fetch (pagination)
    if (response.data.paging && response.data.paging.next) {
      // Recursively fetch the next page
      return await getAllPages(
        accessToken,
        response.data.paging.next,
        combinedPages
      );
    } else {
      // No more pages, return the full result
      return combinedPages;
    }
  } catch (error: any) {
    console.error(
      "Error fetching pages:",
      error.response ? error.response.data : error.message
    );
    return [];
  }
}

async function getManagedPages(accessToken: string): Promise<any[]> {
  try {
    const allPages = await getAllPages(accessToken);
    // Debug: log the raw response for /me/accounts so we can inspect presence of instagram_business_account
    console.debug("getManagedPages: fetched allPages", { length: Array.isArray(allPages) ? allPages.length : 0, allPages });
    // allPages contains Facebook Pages; we need to return Instagram business accounts connected to those pages
    if (!Array.isArray(allPages) || allPages.length === 0) {
      console.debug("getManagedPages: no facebook pages found", { allPages });
      return [];
    }

    // For each FB page that has an instagram_business_account, fetch IG info and page access token in parallel
    const pagesWithIg = allPages.filter((p: any) => p.instagram_business_account);
    console.debug("getManagedPages: pages that claim instagram_business_account", { count: pagesWithIg.length, pages: pagesWithIg.map((p: any) => ({ id: p.id, instagram_business_account: p.instagram_business_account })) });

    const igPromises = pagesWithIg
      .map(async (p: any) => {
        try {
          const igId = p.instagram_business_account?.id;
          if (!igId) return null;

          const [instagramInfoResp, pageTokenInfoResp] = await Promise.all([
            axios.get(
              `https://graph.facebook.com/v21.0/${igId}?fields=name,profile_picture_url,username&access_token=${accessToken}`
            ),
            axios.get(
              `https://graph.facebook.com/v21.0/${p.id}?fields=access_token,name,picture.type(large)&access_token=${accessToken}`
            ),
          ]);

          const instagramInfo = instagramInfoResp.data ?? {};
          const pageTokenInfo = pageTokenInfoResp.data ?? {};

          return {
            pageId: p.id,
            id: igId,
            name: instagramInfo.name,
            username: instagramInfo.username,
            profile_picture_url: instagramInfo.profile_picture_url,
            access_token: pageTokenInfo.access_token,
            info: {
              ...instagramInfo,
              access_token: pageTokenInfo.access_token,
              pageId: p.id,
            },
          };
        } catch (err: any) {
          console.warn(
            "getManagedPages: failed to fetch IG info for page",
            p?.id,
            err?.response?.data ?? err?.message ?? err
          );
          return null;
        }
      });

    const settled = await Promise.allSettled(igPromises);
    const onlyConnectedAccounts = settled
      .filter((s: any) => s.status === "fulfilled" && s.value)
      .map((s: any) => s.value);

    if (!onlyConnectedAccounts || onlyConnectedAccounts.length === 0) {
      console.debug("getManagedPages: no connected Instagram accounts found", {
        allPages,
      });
      return [];
    }

    return onlyConnectedAccounts.map((p: any, index: number) => ({
      id: p.id,
      name: p.name,
      info: p.info,
      isCurrent: index === 0,
    }));
  } catch (error: any) {
    console.error(
      "Error fetching managed pages:",
      error.response?.data || error.message
    );
    return [];
  }
}
