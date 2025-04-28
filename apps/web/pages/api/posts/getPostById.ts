import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getServerSession({ req, res });
    if (!session?.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { query } = req;
    const { credentialId, id } = query;
    
    let numCredentialId = 0;
    if (typeof credentialId === 'string') {
      numCredentialId = parseInt(credentialId, 10);
    }

    let numId = 0;
    if (typeof id === 'string') {
      numId = parseInt(id, 10);
    }

    const post = await prisma.post.findFirst({
      where: {
        userId: session?.user?.id,
        credentialId: numCredentialId,
        id: numId, 
      },
      select: {
        id: true,
        content: true,
        title: true,
        createdDate: true,
        imagesDataURL: true,
        credential: {
          select: {
            avatarUrl: true,
            name: true,
            emailOrUserName: true
          }
        }
      }
    });
    res.status(200).json({ data: post });
    return;
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

export default defaultResponder(handler);
