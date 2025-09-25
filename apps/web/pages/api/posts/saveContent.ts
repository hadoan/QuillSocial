import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import { Post } from "@quillsocial/types/Posts";
import type { NextApiRequest, NextApiResponse } from "next";

interface RequestBody {
  idea: string;
  data: Post[];
  tokens: any;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const session = await getServerSession({ req, res });
      if (!session?.user?.id) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }
      const { idea, data, tokens }: RequestBody = req.body;
      if (!idea && !data) {
        res.status(404).json({ message: "No data to query" });
        return;
      }
      const postData = data.map((data: Post) => ({
        idea: idea,
        content: data.content,
        title: data.title,
        appId: data.appId,
        userId: session?.user?.id,
        credentialId: data.credentialId,
        usageTokens: undefined,
        pageId: data.pageId,
      }));
      if (postData.length > 0) {
        postData[0].usageTokens = tokens;
      }

      const savePost = await prisma.post.createMany({
        data: postData,
      });

      let lastRecords: { id: number; content: string }[] = [];
      if (!savePost) {
        res.status(200).json({ message: "Error when saving" });
        return;
      } else {
        const CountRecordsCreated: number = savePost.count || 0;
        if (CountRecordsCreated > 0) {
          lastRecords = await prisma.post.findMany({
            select: {
              id: true,
              content: true,
              createdDate: true,
              credential: {
                select: {
                  avatarUrl: true,
                  name: true,
                  emailOrUserName: true,
                  appId: true,
                },
              },
            },
            take: CountRecordsCreated,
            orderBy: { id: "desc" },
          });
          res.status(200).json({ lastRecords });
        } else {
          res.status(200).json({ lastRecords: [] });
        }
      }
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error in /api/posts/saveContent:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default defaultResponder(handler);
