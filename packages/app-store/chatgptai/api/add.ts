import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { symmetricEncrypt } from "@quillsocial/lib/crypto";
import logger from "@quillsocial/lib/logger";
import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { organizationId, apiKey, secret } = req.body;
    // Get user
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: req.session?.user?.id,
      },
      select: {
        id: true,
      },
    });

    const data = {
      type: "chatgpt_ai",
      key: symmetricEncrypt(
        JSON.stringify({ organizationId, apiKey, secret }),
        process.env.MY_APP_ENCRYPTION_KEY || ""
      ),
      userId: user.id,
      appId: "chatgpt-ai",
      invalid: false,
    };

    try {
      // await dav?.listCalendars();
      await prisma.credential.create({
        data,
      });
    } catch (reason) {
      logger.error("Could not add this chatgpt account", reason);
      return res
        .status(500)
        .json({ message: "Could not add this chatgpt account" });
    }

    return res.status(200).json({
      url: getInstalledAppPath({ variant: "ai", slug: "chatgpt-ai" }),
    });
  }

  if (req.method === "GET") {
    return res.status(200).json({ url: "/apps/chatgpt-ai/setup" });
  }
}
