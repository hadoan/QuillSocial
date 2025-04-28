import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import { PostStatus } from "@quillsocial/prisma/client";


interface PostData {
  id: number;
  topic: string;
  content: string;
  imagesDataURL: any[];
}

interface RequestBody {
  time: string;
  data: PostData;
  key?: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await getServerSession({ req, res });
    if (!session?.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const { time, data, key }: RequestBody = req.body;
    if (!data) {
      res.status(404).json({ message: "No data to query" });
      return;
    }

    const findBilling = await prisma.billing.findFirst({
      where: {
        userId: session?.user?.id,
      },
      select: {
        type: true,
      },
    });

    if (key) {
      res.status(200).json(0);
    } else {
      if (!time) {
        const updatedData = data.imagesDataURL
          ? {
              content: data.content,
              imagesDataURL: data.imagesDataURL,
            }
          : {
              content: data.content,
            };
      } else {
        // if (checkCondition?.month) {
        //   if (checkCondition?.month === Infinity) {
        //     const updatedPost = await prisma.post.update({
        //       where: {
        //         id: data.id,
        //       },
        //       data: {
        //         status: PostStatus.SCHEDULED,
        //         schedulePostDate: new Date(time).toISOString(),
        //       },
        //     });
        //   } else {
        //     const month = checkCondition?.month;
        //     const isMonthValid = isWithinMonthLimit(time, month);
        //     if (isMonthValid) {
        //       const updatedPost = await prisma.post.update({
        //         where: {
        //           id: data.id,
        //         },
        //         data: {
        //           status: PostStatus.SCHEDULED,
        //           schedulePostDate: new Date(time).toISOString(),
        //         },
        //       });
        //     } else {
        //       res.status(401).json({ message: "Must update subscription plan to use" });
        //     }
        //   }
        // }
        await prisma.post.update({
          where: {
            id: data.id,
          },
          data: {
            status: PostStatus.SCHEDULED,
            schedulePostDate: new Date(time).toISOString(),
          },
        });
      }
      res.status(200).json(1);
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

export default defaultResponder(handler);
