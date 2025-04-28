import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@quillsocial/prisma";
import { PostStatus } from "@quillsocial/prisma/client";

async function handler(
  req: NextApiRequest & { userId?: number },
  res: NextApiResponse
) {
  const { query } = req;
  const { idea, credentialId } = query;
  let numCredentialId = 0;
  if (typeof credentialId === "string") {
    numCredentialId = parseInt(credentialId, 10);
  }
  const session = await getServerSession({ req, res });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  /* To mimic API behavior and comply with types */
  if (!idea) {
    res.status(401).json({ message: "No key to search" });
    return;
  }

  let posts;
  if (idea === "all") {
    posts = await prisma.post.findMany({
      where: {
        userId: session?.user?.id,
        status: PostStatus.NEW,
        credentialId: numCredentialId,
      },
      orderBy: {
        createdDate: "desc",
      },
      select: {
        id: true,
        content: true,
        createdDate: true,
        imagesDataURL: true,
        credential: {
          select: {
            avatarUrl: true,
            name: true,
            emailOrUserName: true,
          },
        },
      },
    });
  } else if (idea === "posted") {
    posts = await prisma.post.findMany({
      where: {
        userId: session?.user?.id,
        status: PostStatus.POSTED,
        credentialId: numCredentialId,
      },
      orderBy: {
        createdDate: "desc",
      },
      select: {
        id: true,
        content: true,
        imagesDataURL: true,
        createdDate: true,
        credential: {
          select: {
            avatarUrl: true,
            name: true,
            emailOrUserName: true,
          },
        },
      },
    });
  } else if (idea === "scheduled") {
    posts = await prisma.post.findMany({
      where: {
        userId: session?.user?.id,
        status: PostStatus.SCHEDULED,
        credentialId: numCredentialId,
      },
      orderBy: {
        createdDate: "desc",
      },
      select: {
        id: true,
        content: true,
        imagesDataURL: true,
        createdDate: true,
        schedulePostDate: true,
        credential: {
          select: {
            avatarUrl: true,
            name: true,
            emailOrUserName: true,
          },
        },
      },
    });
  } else if (idea === "error") {
    posts = await prisma.post.findMany({
      where: {
        userId: session?.user?.id,
        status: PostStatus.ERROR,
        credentialId: numCredentialId,
      },
      orderBy: {
        createdDate: "desc",
      },
      select: {
        id: true,
        content: true,
        imagesDataURL: true,
        createdDate: true,
        schedulePostDate: true,
        credential: {
          select: {
            avatarUrl: true,
            name: true,
            emailOrUserName: true,
          },
        },
      },
    });
  } else {
    res.status(401).json({ message: "Key incorect" });
    return;
  }
  return posts;
}

export default defaultResponder(handler);
