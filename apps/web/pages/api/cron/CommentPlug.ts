import { TwitterV1Manager } from "@quillsocial/app-store/twitterv1social/lib";
import { TWITTER_APP_ID } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = req.headers.authorization || req.query.apiKey;

  if (process.env.CRON_API_KEY !== apiKey) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }
  const plugs = await prisma.plug.findMany({
    where: {
      status: "NEW",
      schedulePostDate: {
        not: null,
        lte: new Date(),
      },
      post: {
        result: {
          not: undefined,
        },
      },
    },
    select: {
      id: true,
      content: true,
      post: {
        select: {
          id: true,
          appId: true,
          result: true,
          credentialId: true,
        },
      },
    },
  });
  if (plugs.length > 0) {
    await Promise.all(
      plugs.map((p) => {
        console.log("commenting for ", p);
        if (p.post?.appId === TWITTER_APP_ID) {
          return TwitterV1Manager.commentPost(
            p.post.credentialId,
            p.id,
            p.content,
            p.post.result
          );
        } else if (p.post?.appId === "linkedin-social") {
          // return LinkedinManager.post(p.id);
        }
        return;
      })
    );
  } else {
    console.log("No data to update");
  }
  res.status(200).json(plugs.length);
}
