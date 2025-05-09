import { getPlaceholderAvatar } from "@quillsocial/lib/defaultAvatarImage";
import prisma from "@quillsocial/prisma";
import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { defaultAvatarSrc } from "@lib/profile";

const querySchema = z
  .object({
    username: z.string(),
    teamname: z.string(),
    /**
     * Allow fetching avatar of a particular organization
     * Avatars being public, we need not worry about others accessing it.
     */
    orgId: z.string().transform((s) => Number(s)),
  })
  .partial();

async function getIdentityData(req: NextApiRequest) {
  const { username, teamname, orgId } = querySchema.parse(req.query);

  if (username) {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
      select: { avatar: true, email: true },
    });
    return {
      name: username,
      email: user?.email,
      avatar: user?.avatar,
    };
  }
  if (teamname) {
    const team = await prisma.team.findFirst({
      where: {
        slug: teamname,
      },
      select: { logo: true },
    });
    return {
      name: teamname,
      email: null,
      avatar: team?.logo || getPlaceholderAvatar(null, teamname),
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const identity = await getIdentityData(req);
  const img = identity?.avatar;
  // If image isn't set or links to this route itself, use default avatar
  if (!img) {
    res.writeHead(302, {
      Location: defaultAvatarSrc({
        md5: crypto
          .createHash("md5")
          .update(identity?.email || "guest@example.com")
          .digest("hex"),
      }),
    });

    return res.end();
  }

  if (!img.includes("data:image")) {
    res.writeHead(302, { Location: img });
    return res.end();
  }

  const decoded = img
    .toString()
    .replace("data:image/png;base64,", "")
    .replace("data:image/jpeg;base64,", "");
  const imageResp = Buffer.from(decoded, "base64");

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": imageResp.length,
  });
  res.end(imageResp);
}
