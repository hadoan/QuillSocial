import type { NextApiRequest, NextApiResponse } from "next";

import { symmetricEncrypt } from "@quillsocial/lib/crypto";
import logger from "@quillsocial/lib/logger";
import prisma from "@quillsocial/prisma";

import getInstalledAppPath from "../../_utils/getInstalledAppPath";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { apiKey, secret, accessToken, accessSecret } = req.body;
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
      type: "xconsumerkeys_social",
      key: symmetricEncrypt(
        JSON.stringify({ apiKey, secret, accessToken, accessSecret }),
        process.env.MY_APP_ENCRYPTION_KEY || ""
      ),
      userId: user.id,
      appId: "xconsumerkeys-social",
      invalid: false,
    };

    try {
      // await dav?.listCalendars();
      await prisma.credential.create({
        data,
      });
    } catch (reason) {
      logger.error("Could not add this x account", reason);
      return res.status(500).json({ message: "Could not add this x account" });
    }

    return res
      .status(200)
      .json({
        url: getInstalledAppPath({
          variant: "social",
          slug: "xconsumerkeys-social",
        }),
      });
  }

  if (req.method === "GET") {
    return res.status(200).json({ url: "/apps/xconsumerkeys-social/setup" });
  }
}
