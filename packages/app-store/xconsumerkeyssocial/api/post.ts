import type { NextApiRequest, NextApiResponse } from "next";

import { post } from "../lib/twitterManager";

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
      const isSuccess = await post(id);
      if (isSuccess) {
        res.status(200).json({ success: true });
      } else {
        res
          .status(400)
          .json({
            success: false,
            error: "Posting failed. Make sure you have an X Social account connected for user authentication, as consumer keys alone cannot post tweets."
          });
      }
    } else {
      res.status(400).json({ success: false, error: "Invalid Id value" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
