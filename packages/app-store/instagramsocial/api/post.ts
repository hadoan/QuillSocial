import { post } from "../lib/instagramManager";
import type { NextApiRequest, NextApiResponse } from "next";

//http://localhost:3000/api/integrations/instagramsocial/post?id={postId}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = (req as any).session?.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  if (req.method === "POST") {
    const idQuery = req.query.id;
    if (idQuery && +idQuery > 0) {
      const id = +idQuery;
      try {
        const result = await post(id);
        if (result) {
          res.status(200).json({ success: true, result });
        } else {
          res.status(400).json({ success: false, error: "Failed to post to Instagram" });
        }
      } catch (error: any) {
        console.error("Error posting to Instagram:", error.message);
        res.status(500).json({ success: false, error: error.message });
      }
    } else {
      res.status(400).json({ success: false, error: "Invalid Id value" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
