import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { getSafeRedirectUrl } from "@quillsocial/lib/getSafeRedirectUrl";
import prisma from "@quillsocial/prisma";
import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

import { decodeOAuthState } from "../../_utils/decodeOAuthState";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { fetchUserInfo } from "../lib/googleMyBusinessManager";

let client_id = "";
let client_secret = "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.query);
  const { code } = req.query;
  const state = decodeOAuthState(req);

  if (code && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  const appKeys = await getAppKeysFromSlug("google-calendar");
  if (typeof appKeys.client_id === "string") client_id = appKeys.client_id;
  if (typeof appKeys.client_secret === "string") client_secret = appKeys.client_secret;
  if (!client_id) return res.status(400).json({ message: "Google client_id missing." });
  if (!client_secret) return res.status(400).json({ message: "Google client_secret missing." });

  const redirect_uri = WEBAPP_URL + "/api/integrations/youtubesocial/callback";

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

  let key: any = undefined;

  if (code) {
    const token = await oAuth2Client.getToken(code);
    key = token.res?.data;
  }
  console.log(key);
  const userInfo = await fetchUserInfo(key.access_token);
  key.userInfo = userInfo;
  const { name, picture, email } = userInfo;
  const appId = "youtube-social";
  await prisma.credential.upsert({
    where: {
      userId_appId_emailOrUserName: {
        userId: req.session.user.id,
        emailOrUserName: email,
        appId
      }
    },
    create: {
      type: "youtube_social",
      key,
      userId: req.session.user.id,
      appId,
      avatarUrl: picture,
      emailOrUserName: email,
      name
    },
    update: {
      name,
      avatarUrl: picture,
      key
    }
  });

  res.redirect(
    getSafeRedirectUrl(state?.returnTo) ??
    getInstalledAppPath({ variant: "calendar", slug: "youtube-social" })
  );
}
