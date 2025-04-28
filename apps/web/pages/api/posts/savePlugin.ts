import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import prisma from "@quillsocial/prisma";
import { TimeType } from "@quillsocial/prisma/enums";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await getServerSession({ req, res });
    if (!session?.user?.id) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { id, plugin } = req.body;
    const post = await prisma.post.findUnique({ where: { id } });
    const time = parseInt(plugin?.time, 10);
    const timeType = plugin?.timeType as TimeType;
    const postDate = post?.schedulePostDate ? post.schedulePostDate : post?.createdDate ?? new Date();
    const seconds = timeType === TimeType.MINUTE ? 1000 * 60 : 1000 * 60 * 60;
    const schedulePostDate = new Date(postDate.getTime() + time * seconds);

    const newPlug = await prisma.plug.create({
      data: {
        content: plugin?.comment as string,
        time,
        timeType,
        schedulePostDate,
        post: {
          connect: {
            id
          }
        }
      }
    });
    return newPlug;
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

export default defaultResponder(handler);
