import { CACHE } from ".";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import { TwitterApi } from "twitter-api-v2";

let appKey = "";
let appSecret = "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get token from Twitter Calendar API
    const appKeys = await getAppKeysFromSlug("twitterv1-social");
    if (typeof appKeys.appKey === "string") appKey = appKeys.appKey;
    if (typeof appKeys.appSecret === "string") appSecret = appKeys.appSecret;
    if (!appKey)
      return res.status(400).json({ message: "Twitter appKey missing." });
    if (!appSecret)
      return res.status(400).json({ message: "Twitter appSecret missing." });

    // const { authUrl } = getXAuthClient(appKey, appSecret);
    // const client = new TwitterApi({ clientId: appKey, clientSecret: appSecret });
    const client = new TwitterApi({ appKey, appSecret });
    const callback = WEBAPP_URL + "/api/integrations/twitterv1social/callback";
    const { oauth_token, oauth_token_secret, url } =
      await client.generateAuthLink(callback);
    // CACHE.set(callback, { codeVerifier, state});
    CACHE.set(oauth_token, { oauth_token_secret, client });
    res.status(200).json({ url });
  }
}
