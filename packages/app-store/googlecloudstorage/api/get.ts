// pages/api/get-signed-url.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getFile } from "../lib/getFile";

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

  const videoFileName = req.query.file; // Replace with your actual video file path
  if (!videoFileName) {
    res
      .status(400)
      .json({ success: false, error: "Invalid videoFileName value" });
  }

  // Generate a signed URL valid for 5 minutes
  const signedUrl = await getFile(videoFileName as string);
  if (signedUrl) {
    res.status(200).json({ signedUrl });
  } else {
    res
      .status(400)
      .json({ success: false, error: "Could get signed URL for video file" });
  }
}
