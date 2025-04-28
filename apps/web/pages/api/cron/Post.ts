import type { NextApiRequest, NextApiResponse } from "next";

import { LinkedinManager } from "@quillsocial/app-store/linkedinsocial/lib";
import prisma from "@quillsocial/prisma";
import { TWITTER_APP_ID } from "@quillsocial/lib/constants";
import { TwitterV1Manager } from "@quillsocial/app-store/twitterv1social/lib";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("---------------");
  console.log("schedule job");
  console.log("---------------");
  const apiKey = req.headers.authorization || req.query.apiKey;
  console.log(apiKey);
  console.log(process.env);
  if (process.env.CRON_API_KEY !== apiKey) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }
  const posts = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      schedulePostDate: {
        not: null,
        lte: new Date(),
      },
      credential: {
        appId: {
          not: null,
        },
      },
    },
    select: {
      id: true,
      credential: {
        select: {
          appId: true,
        },
      },
    },
  });
  if (posts.length > 0) {
    await Promise.all(
      posts.map((p) => {
        if (p.credential?.appId === TWITTER_APP_ID) {
          return TwitterV1Manager.post(p.id);
        } else if (p.credential?.appId === "linkedin-social") {
          return LinkedinManager.post(p.id);
        }
        return;
      })
    );
  } else {
    console.log("No data to update");
  }
  res.status(200).json(posts.length);
}
