import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { makeId } from "@quillsocial/lib/make.is";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

let app_id = "";
let app_secret = "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get token from Twitter Calendar API
    const appKeys = await getAppKeysFromSlug("facebook-social");
    if (typeof appKeys.app_id === "string") app_id = appKeys.app_id;
    if (typeof appKeys.app_secret === "string") app_secret = appKeys.app_secret;
    if (!app_id)
      return res.status(400).json({ message: "Facebook app_id missing." });
    if (!app_secret)
      return res.status(400).json({ message: "Facebook app_secret missing." });
    // app_id = "734048535498013"
    // redirect to the server-side callback which will complete the oauth flow
    const redirectUri =
      WEBAPP_URL + "/api/integrations/facebooksocial/callback";

    const scopes = [
      "email",
      "pages_show_list",
      "pages_manage_posts",
      "pages_read_engagement",
    ];
    // allow client to pass a state and codeVerifier; if missing generate simple ones to return
    const clientState =
      (req.query.state as string) ||
      `st_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const codeVerifier =
      (req.query.codeVerifier as string) ||
      `cv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const state = makeId(6);
    const oauthUrl =
      `https://www.facebook.com/v23.0/dialog/oauth?client_id=${app_id}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopes.join(",")}` +
      `&state=${encodeURIComponent(state)}`;

    // We don't need to call Facebook here; just return the constructed url and the generated state/codeVerifier
    res.status(200).json({ url: oauthUrl, state: state, codeVerifier });
  }
}

// 298618816923610?fields=id,instagram_business_account
