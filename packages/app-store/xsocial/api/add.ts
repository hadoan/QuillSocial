import { WEBAPP_URL } from "@quillsocial/lib/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { TwitterApi } from "twitter-api-v2";
import { CACHE } from ".";
let client_id = "";
let client_secret = "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get token from Twitter Calendar API
    const appKeys = await getAppKeysFromSlug("x-social");
    if (typeof appKeys.client_id === "string") client_id = appKeys.client_id;
    if (typeof appKeys.client_secret === "string")
      client_secret = appKeys.client_secret;
    if (!client_id)
      return res.status(400).json({ message: "Twitter client_id missing." });
    if (!client_secret)
      return res
        .status(400)
        .json({ message: "Twitter client_secret missing." });

    // const { authUrl } = getXAuthClient(client_id, client_secret);
    const client = new TwitterApi({
      clientId: client_id,
      clientSecret: client_secret,
    });
    const callback = WEBAPP_URL + "/api/integrations/xsocial/callback";

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      callback,
      { scope: ["tweet.read", "users.read", "offline.access", "tweet.write"] }
    );
    CACHE.set(callback, { codeVerifier, state });
    res.status(200).json({ url });
  }
}
