import type { NextApiRequest, NextApiResponse } from "next";

import { generateStatus } from "@quillsocial/app-store/chatgptai/lib/completions/generate-status";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";

async function handler(req: NextApiRequest & { userId?: number }, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
  // const { query } = req;
  const { type, idea } = req.body;
  if (!idea) {
    res.status(404).json({ message: "No idea to query" });
    return;
  }
  const session = await getServerSession({ req, res });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  /* To mimic API behavior and comply with types */
  req.userId = session?.user?.id || -1;
  const user = await prisma?.user.findUnique({ where: { id: session?.user?.id || -1 } });
  const content = await generateStatus(
    req.userId,
    type,
    idea as string,
    user?.description || "",
    user?.speakAbout || ""
  );
  return content;
}

export default defaultResponder(handler);
