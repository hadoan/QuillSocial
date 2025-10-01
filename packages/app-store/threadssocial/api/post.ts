import { ThreadsManager } from "../lib";
import type { NextApiRequest, NextApiResponse } from "next";

// http://localhost:3000/api/integrations/threadssocial/post?id={postId}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = Number(idParam);
  if (!id || Number.isNaN(id) || id <= 0) {
    return res.status(400).json({ success: false, error: "Invalid Id value" });
  }

  const result = await ThreadsManager.post(id);
  if (result) {
    res.status(200).json({ success: true });
    return;
  }

  res.status(400).json({ success: false, error: "Failed to post to Threads (missing token or user id)" });
  return;
}
