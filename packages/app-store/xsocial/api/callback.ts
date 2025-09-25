import { CACHE } from ".";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { TOAuth2Scope, TwitterApi } from "twitter-api-v2";

let client_id = "";
let client_secret = "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { state, code } = req.query;
  const callback = WEBAPP_URL + "/api/integrations/xsocial/callback";

  if (code && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }
  if (!req.session?.user?.id) {
    return res
      .status(401)
      .json({ message: "You must be logged in to do this" });
  }
  const { codeVerifier, state: sessionState } = CACHE.get(callback);
  if (!codeVerifier || !state || !sessionState || !code) {
    return res.status(400).send("You denied the app or your session expired!");
  }
  if (state !== sessionState) {
    return res.status(400).send("Stored tokens didnt match!");
  }

  const appKeys = await getAppKeysFromSlug("x-social");
  if (typeof appKeys.client_id === "string") client_id = appKeys.client_id;
  if (typeof appKeys.client_secret === "string")
    client_secret = appKeys.client_secret;
  if (!client_id)
    return res.status(400).json({ message: "X client_id missing." });
  if (!client_secret)
    return res.status(400).json({ message: "X client_secret missing." });

  const client = new TwitterApi({
    clientId: client_id,
    clientSecret: client_secret,
  });
  const {
    client: loggedInClient,
    expiresIn,
    accessToken,
    scope,
    refreshToken,
  } = await client.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callback,
  });

  const { data: userObject } = await loggedInClient.v2.me({
    "user.fields": ["username", "profile_image_url"],
  });
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
  const key = {
    token: {
      scope: scope.map((x: TOAuth2Scope) => x.toString()),
      token_type: "bearer",
      expires_at: expiresIn,
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  };
  const existed = existedCredentials?.find(
    (x) => x.appId === "x-social" && x.emailOrUserName == userObject?.username
  );
  const data = {
    type: "x_social",
    key,
    userId: req.session.user.id,
    appId: "x-social",
    avatarUrl: userObject.profile_image_url,
    name: userObject.name,
    emailOrUserName: userObject.username,
  };
  const id = existed?.id ?? 0;
  let isUserCurrentProfile: boolean | null =
    !existedCredentials || existedCredentials.length === 0 ? true : false;
  if (existed) {
    isUserCurrentProfile = existed.isUserCurrentProfile;
  }
  await prisma.credential.upsert({
    where: {
      id,
    },
    create: {
      ...data,
      isUserCurrentProfile,
    },
    update: data,
  });

  res.redirect(getInstalledAppPath({ variant: "social", slug: "x-social" }));
}
