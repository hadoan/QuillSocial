import { WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { TOAuth2Scope, TwitterApi } from "twitter-api-v2";
import { CACHE } from ".";


let appKey = "";
let appSecret = "";

export default async function handler(req: any, res: NextApiResponse) {
  // Extract tokens from query string
  const { oauth_token, oauth_verifier } = req.query;

  const appKeys = await getAppKeysFromSlug("twitterv1-social");
  if (typeof appKeys.appKey === "string") appKey = appKeys.appKey;
  if (typeof appKeys.appSecret === "string") appSecret = appKeys.appSecret;
  if (!appKey) return res.status(400).json({ message: "Twitter appKey missing." });
  if (!appSecret) return res.status(400).json({ message: "Twitter appSecret missing." });

  const { oauth_token_secret } = CACHE.get(oauth_token);
  const twitterClient = new TwitterApi({ appKey, appSecret, accessToken: oauth_token, accessSecret: oauth_token_secret });
 
  const { accessToken, accessSecret, userId, screenName, client } = await twitterClient.login(oauth_verifier);
  
  const userV1 = await client.currentUser(true);
  const existedCredentials = await prisma.credential.findMany({
    where: {
      userId: req.session.user.id
    },
    select: {
      id: true,
      emailOrUserName: true,
      appId: true,
      isUserCurrentProfile: true
    }
  });
  const key = {
    token: {
      accessToken,
      accessSecret,
      userId,
      screenName
    }
  }
  const existed = existedCredentials?.find(x => x.appId === 'twitterv1-social' && x.emailOrUserName == userId);
  const data = {
    type: "twitterv1_social",
    key,
    userId: req.session.user.id,
    appId: "twitterv1-social",
    avatarUrl: userV1.profile_image_url_https,
    name: screenName,
    emailOrUserName: userId,
  };
  const id = existed?.id ?? 0;
  let isUserCurrentProfile: boolean | null = !existedCredentials || existedCredentials.length === 0 ? true : false
  if (existed) {
    isUserCurrentProfile = existed.isUserCurrentProfile
  }
  await prisma.credential.upsert({
    where: {
      id
    },
    create: {
      ...data,
      isUserCurrentProfile
    },
    update: data
  });

  res.redirect(getInstalledAppPath({ variant: "social", slug: "twitterv1-social" }));
}
