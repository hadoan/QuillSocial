import { post } from "../lib/twitterManager";
import type { NextApiRequest, NextApiResponse } from "next";

//http://localhost:3000/api/integrations/xconsumerkeyssocial/post?id={postId}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "You must be logged in to do this" });
  }

  if (req.method === "POST") {
    const idQuery = req.query.id;
    if (idQuery && +idQuery > 0) {
      const id = +idQuery;
      const result = await post(id);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({
          success: false,
          error:
            result.error ||
            "Posting failed. Please ensure you have provided all required credentials: Consumer Key, Consumer Secret, Access Token, and Access Token Secret. If you've only added Consumer Keys, please update your X Consumer Keys integration to include Access Tokens.",
        });
      }
    } else {
      res.status(400).json({ success: false, error: "Invalid Id value" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
