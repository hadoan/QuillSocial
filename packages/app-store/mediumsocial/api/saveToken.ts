import prisma from "@quillsocial/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = req.body;
  if (!data) {
    res.status(400).json({ message: "Could not find key data." });
  }

  // { integrationToken: 'ss', integrationToken1: 'sav' }
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  const { integrationToken } = data;
  const appId = "medium-social";

  const userInfo = await getUserInfo(integrationToken);
  if (userInfo == null) {
    res.status(400).json({ message: "Token is invalid" });
    return;
  }

  const key = {
    integrationToken,
    ...userInfo,
  }

  await prisma.credential.upsert({
    where: {
      userId_appId_emailOrUserName: {
        emailOrUserName: userInfo.id,
        appId,
        userId: req.session.user.id,
      }
    },
    update: {
      key
    },
    create: {
      emailOrUserName: userInfo.name,
      type: "medium_social",
      key,
      userId: req.session.user.id,
      appId: "medium-social",
      avatarUrl: userInfo.imageUrl,
      name: userInfo.name
    }
  })


  return res.status(200).json({ message: "Ok" });
}

const getUserInfo = async (accessToken: string) => {

  const meUrl = 'https://api.medium.com/v1/me';

  try {
    const response = await axios.get(meUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (response.data?.data) {
      const { id, username, name, url, imageUrl } = response.data.data;
      return { id, username, name, url, imageUrl };
    }
    return null;
  } catch (error: any) {
    console.error('Error:', error.message);
    return null;
  }

}