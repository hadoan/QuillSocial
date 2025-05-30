import type { NextApiRequest, NextApiResponse } from "next";

import { generateStatus } from "@quillsocial/app-store/chatgptai/lib/completions/generate-status";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";

async function handler(
  req: NextApiRequest & { userId?: number },
  res: NextApiResponse
) {
  // const { query } = req;
  // const { idea } = query;
  // if (!idea) {
  //   res.status(404).json({ message: "No idea to query" });
  //   return;
  // }
  // const session = await getServerSession({ req, res });
  // if (!session?.user?.id) {
  //   res.status(401).json({ message: "Not authenticated" });
  //   return;
  // }
  // /* To mimic API behavior and comply with types */
  // req.userId = session?.user?.id || -1;
  // const content = await generateStatus("twitter", idea as string,"","");
  // return content;
  return "";
}

export default defaultResponder(handler);
