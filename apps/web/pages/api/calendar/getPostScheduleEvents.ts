import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { PostStatus } from "@quillsocial/prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getServerSession({ req, res });
    if (!session?.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { query } = req;
    const { credentialId } = query;
    let numCredentialId = 0;
    if (typeof credentialId === "string") {
      numCredentialId = parseInt(credentialId, 10);
    }
    const posts = await prisma.post.findMany({
      where: {
        userId: session?.user?.id,
        credentialId: numCredentialId,
        status: PostStatus.SCHEDULED,
      },
      orderBy: {
        createdDate: "desc",
      },
      select: {
        id: true,
        content: true,
        schedulePostDate: true,
        credential: {
          select: {
            name: true,
            emailOrUserName: true,
            appId: true,
          },
        },
      },
    });
    res.status(200).json({ data: posts });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

export default defaultResponder(handler);
