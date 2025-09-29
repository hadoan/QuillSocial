import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
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

  const appKeys = await getAppKeysFromSlug("threads-social");
  if (typeof appKeys.app_id === "string") app_id = appKeys.app_id;
  if (typeof appKeys.app_secret === "string") app_secret = appKeys.app_secret;
  if (!app_id)
    return res.status(400).json({ message: "Threads app_id missing." });
  if (!app_secret)
    return res.status(400).json({ message: "Threads app_secret missing." });

  const redirectUri = WEBAPP_URL + "/api/integrations/threadssocial/callback";

  let key: any = undefined;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }
  try {
    // Exchange code for short-lived access token
    const tokenResponse = await axios.get(
      "https://graph.threads.net/oauth/access_token",
      {
        params: {
          client_id: app_id,
          client_secret: app_secret,
          redirect_uri: redirectUri,
          code: code as string,
          grant_type: "authorization_code",
        },
      }
    );

    key = tokenResponse?.data;

    // Threads supports exchanging for a longer-lived token
    try {
      const exchange = await axios.get(
        "https://graph.threads.net/access_token",
        {
          params: {
            grant_type: "th_exchange_token",
            client_secret: app_secret,
            access_token: key?.access_token,
          },
        }
      );
      if (exchange?.data?.access_token) {
        key = { ...key, ...exchange.data };
      }
    } catch (e) {
      // ignore exchange failure and continue with the original token
      console.warn(
        "Threads token exchange failed, continuing with short-lived token"
      );
    }

    const userData = await getUserData(key?.access_token);
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
        x.appId === "threads-social" && x.emailOrUserName == userData?.username
    );
    const id = existed?.id ?? 0;
    let isUserCurrentProfile: boolean | null =
      !existedCredentials || existedCredentials.length === 0 ? true : false;
    if (existed) {
      isUserCurrentProfile = existed.isUserCurrentProfile;
    }

    const data = {
      type: "threads_social",
      key,
      userId: req.session.user.id,
      appId: "threads-social",
      avatarUrl: userData?.threads_profile_picture_url || undefined,
      name: userData?.username,
      emailOrUserName: userData?.username,
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
    // Threads does not have managed pages; redirect back to installed app path for threads-social
    res.redirect(
      getInstalledAppPath({ variant: "social", slug: "threads-social" })
    );
  } catch (error: any) {
    console.error("Error exchanging code for token:", error.message);
    return res.status(500).send("Error exchanging code for token");
  }
}

async function getUserData(accessToken: string) {
  if (!accessToken) return undefined;
  const userUrl = `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${accessToken}`;
  const responseUser = await axios.get(userUrl);
  return responseUser.data;
}
