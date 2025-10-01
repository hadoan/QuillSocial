import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await getServerSession({ req, res });
    if (!session?.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { data } = req.body;
    let imagesDataURL;
    if (data.imagesDataURL && data.imagesDataURL[0] === "deleteImage") {
      imagesDataURL = [];
    } else {
      imagesDataURL = data.imagesDataURL;
    }

    const existedPost = data?.id
      ? await prisma.post.findFirst({
          where: { id: data?.id },
          select: {
            idea: true,
            id: true,
            usageTokens: true,
            cloudFiles: {
              select: {
                cloudFileId: true,
                id: true,
              },
            },
          },
        })
      : null;

    const newData = {
      idea: existedPost?.idea ?? "",
      content: data.content,
      title: data.title,
      userId: session?.user?.id,
      usageTokens: existedPost?.usageTokens ?? undefined,
      imagesDataURL: imagesDataURL,
      pageId: data.pageId,
      xcommunity: data.xcommunity,
      app: data.appId ? {
        connect: {
          slug: data.appId
        }
      } : undefined,
      credential: data.credentialId ? {
        connect: {
          id: data.credentialId
        }
      } : undefined,
    };

    const createCloudFiles = data.fileInfo?.id
      ? {
          cloudFiles: {
            create: {
              cloudFile: {
                connect: {
                  id: data.fileInfo.id,
                },
              },
            },
          },
        }
      : {};

    const updateCloudFiles =
      data.fileInfo?.id &&
      (!existedPost?.cloudFiles || existedPost?.cloudFiles.length == 0)
        ? {
            cloudFiles: {
              create: {
                cloudFile: {
                  connect: {
                    id: data.fileInfo.id,
                  },
                },
              },
            },
          }
        : {};
    const saveDraft = await prisma.post.upsert({
      where: { id: data?.id },
      create: {
        ...newData,
        ...createCloudFiles,
      },
      update: {
        ...newData,
        ...updateCloudFiles,
      },
    });
    return saveDraft;
  }
}

export default defaultResponder(handler);
