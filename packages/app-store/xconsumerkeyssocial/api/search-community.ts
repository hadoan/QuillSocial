import { searchXCommunityIdByName } from "../lib/twitterManager";
import type { NextApiRequest, NextApiResponse } from "next";

// GET http://localhost:3000/api/integrations/xconsumerkeyssocial/search-community?credentialId=1&name=CommunityName
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

  if (req.method === "GET") {
    const credentialIdQuery = req.query.credentialId;
    const name = typeof req.query.name === "string" ? req.query.name : "";

    const credentialId = credentialIdQuery ? +credentialIdQuery : NaN;
    if (!credentialId || credentialId <= 0) {
      return res.status(400).json({ success: false, error: "Invalid credentialId" });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, error: "Invalid or missing name query" });
    }

    const result = await searchXCommunityIdByName(credentialId, name);
    if (result.error) {
      return res.status(400).json({ success: false, error: result.error, raw: result.raw });
    }

    return res.status(200).json({ success: true, id: result.id, name: result.name, raw: result.raw });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
