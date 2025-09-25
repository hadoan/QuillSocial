// import { completePostStatus } from "@quillsocial/azureopenai/completions/complete-post";
import { completePostStatus } from "@quillsocial/app-store/chatgptai/lib/completions/complete-post";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest & { userId?: number },
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
  const session = await getServerSession({ req, res });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const { instruction, idea } = req.body;

  /* To mimic API behavior and comply with types */
  req.userId = session?.user?.id || -1;
  const { tokens, post } = await completePostStatus(
    req.userId,
    instruction,
    idea
  );
  return { tokens, post };
}

export default defaultResponder(handler);
