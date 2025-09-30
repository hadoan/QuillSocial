import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { facebookCredentialSchema } from "../lib/facebookCredentialSchema";

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

  const appKeys = await getAppKeysFromSlug("facebook-social");
  if (typeof appKeys.app_id === "string") app_id = appKeys.app_id;
  if (typeof appKeys.app_secret === "string") app_secret = appKeys.app_secret;
  if (!app_id) return res.status(400).json({ message: "Facebook app_id missing." });
  if (!app_secret) return res.status(400).json({ message: "Facebook app_secret missing." });

  const redirectUri = WEBAPP_URL + "/api/integrations/facebooksocial/callback";

  let key: any = undefined;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }
  try {
    const tokenResponse = await axios.get("https://graph.facebook.com/v23.0/oauth/access_token", {
      params: {
        client_id: app_id,
        client_secret: app_secret,
        redirect_uri: redirectUri,
        code,
      },
    });
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
      (x) => x.appId === "facebook-social" && x.emailOrUserName == userData?.email
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

    res.redirect(getInstalledAppPath({ variant: "social", slug: "facebook-social" }));
  } catch (error: any) {
    console.error("Error exchanging code for token:", error.message);
    return res.status(500).send("Error exchanging code for token");
  }
}

async function getProfilePictureUrl(userId: string, access_token: string) {
  try {
    const response = await axios.get(`https://graph.facebook.com/v19.0/${userId}/picture`, {
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
        fields: "name,id,picture,access_token",
        access_token: accessToken,
      },
    });

    // Combine current response data with the previously fetched pages
    const combinedPages = [...pages, ...response.data.data];

    // Check if there are more pages to fetch (pagination)
    if (response.data.paging && response.data.paging.next) {
      // Recursively fetch the next page
      return await getAllPages(accessToken, response.data.paging.next, combinedPages);
    } else {
      // No more pages, return the full result
      return combinedPages;
    }
  } catch (error: any) {
    console.error("Error fetching pages:", error.response ? error.response.data : error.message);
    return [];
  }
}

async function getManagedPages(accessToken: string): Promise<any[] | undefined> {
  try {
    // const response = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?fields=name,id,picture,access_token`, {
    //   params: {
    //     access_token: accessToken,
    //   },
    // });

    try {
      const allPages = await getAllPages(accessToken);
      console.log("All Pages:", allPages);

      // const allIntagramAccounts = await getAllPagesWithInstagram(accessToken);
      if (allPages) {
        const pageInfoes = allPages.map((x: any) => ({
          id: x.id,
          name: x.name,
          info: x,
          isCurrent: x.id === allPages[0].id,
        }));

        await Promise.all(
          pageInfoes.map(async (page: { id: string }) => {
            const instagramAcocunts = await getConnectedInstagramAccounts(accessToken, page.id);
            return instagramAcocunts;
          })
        );

        return pageInfoes;
      }
    } catch (error) {
      console.error("Error:", error);
    }

    return undefined;
  } catch (error: any) {
    console.error("Error fetching managed pages:", error.response?.data || error.message);
    return undefined;
  }
}

async function getConnectedInstagramAccounts(accessToken: string, pageId: string) {
  const instagramBusinessAccountUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account,access_token,name&access_token=${accessToken}`;
  console.log(instagramBusinessAccountUrl);
  axios
    .get(instagramBusinessAccountUrl)
    .then((response) => {
      console.log(response.data, "---", pageId);
      // This response should include the Instagram business account details
    })
    .catch((error) => {
      console.error("Error fetching Instagram business account details:", error);
    });
}

// async function getAllPagesWithInstagram(
//   accessToken: string,
//   url = "https://graph.facebook.com/v19.0/me/accounts",
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
