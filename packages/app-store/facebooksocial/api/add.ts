import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { WEBAPP_URL } from "@quillsocial/lib/constants";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

let app_id = "";
let app_secret = "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Get token from Twitter Calendar API
    const appKeys = await getAppKeysFromSlug("facebook-social");
    if (typeof appKeys.app_id === "string") app_id = appKeys.app_id;
    if (typeof appKeys.app_secret === "string") app_secret = appKeys.app_secret;
    if (!app_id) return res.status(400).json({ message: "Facebook app_id missing." });
    if (!app_secret) return res.status(400).json({ message: "Facebook app_secret missing." });
    // app_id = "734048535498013"
    const redirectUri = WEBAPP_URL + "/api/integrations/facebooksocial/callback";
    // const scopes = "email user_posts pages_read_engagement pages_manage_posts";
    // const scopes = "email pages_show_list pages_manage_posts instagram_basic instagram_manage_insights instagram_content_publish";
    const scopes = "email pages_show_list pages_manage_posts";
    //https://www.facebook.com/v19.0/dialog/oauth?client_id=776354511178147&redirect_uri=http://localhost&state={%22{st=state123abc,ds=123456789}%22}
    const response = await axios.get(
      `https://www.facebook.com/v19.0/dialog/oauth?client_id=${app_id}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`
    );
    res.status(200).json({ url: response.request.res.responseUrl });
  }
}


// 298618816923610?fields=id,instagram_business_account
