import { checkUsername } from "@quillsocial/lib/server/checkUsername";
import type { NextApiRequest, NextApiResponse } from "next";

type Response = {
  available: boolean;
  premium: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
): Promise<void> {
  const result = await checkUsername(req.body.username, null);
  return res.status(200).json(result);
}
