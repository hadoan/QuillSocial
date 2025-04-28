import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import { Prisma } from "@quillsocial/prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { string } from "zod";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getServerSession({ req, res });
    if (!session?.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { query } = req;
    const { credentialId, pageId } = query;
    let numCredentialId = 0;
    if (typeof credentialId === "string") {
      numCredentialId = parseInt(credentialId, 10);
    }

    const where: Prisma.PostWhereInput = pageId
      ? {
          userId: session?.user?.id,
          credentialId: numCredentialId,
          status: "NEW",
          pageId: pageId as string,
        }
      : {
          userId: session?.user?.id,
          credentialId: numCredentialId,
          status: "NEW",
        };

    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        createdDate: "desc",
      },
      select: {
        id: true,
        content: true,
        title: true,
        createdDate: true,
        imagesDataURL: true,
        pageId: true,
        credential: {
          select: {
            avatarUrl: true,
            name: true,
            emailOrUserName: true,
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
