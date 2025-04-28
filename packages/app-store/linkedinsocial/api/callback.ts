import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { resetCachedSocialProfile } from "@quillsocial/features/auth/lib/socialProfiles";
import { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";

import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { PageInfo } from "../../types";
import { LinkedinManager } from "../lib";
import { getUserProfile } from "../lib/linkedinManager";

const app_id = LINKEDIN_CLIENT_ID;
const app_secret = LINKEDIN_CLIENT_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  const redirectUri = WEBAPP_URL + "/api/integrations/linkedinsocial/callback";

  if (code && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  if (typeof code === "string") {
    const token = await getAccessToken(code, app_id!, app_secret!, redirectUri);
    const user = await getUserProfile(token.access_token);
    let pages: PageInfo[] = [
      {
        id: `urn:li:person:${user.sub}`,
        name: user.name,
        isCurrent: true,
        info: user,
      },
    ];
    const companyPages = await LinkedinManager.getLinkedInPages(token.access_token);
    if (companyPages) {
      pages.push(...companyPages);
    }
    const existedCredentials = await prisma.credential.findMany({
      where: {
        userId: req.session.user.id,
      },
      select: {
        id: true,
        emailOrUserName: true,
        appId: true,
        isUserCurrentProfile: true,
      },
    });
    const key = token;
    const existed = existedCredentials?.find(
      (x) => x.appId === "linkedin-social" && x.emailOrUserName == user?.email
    );
    const data = {
      type: "linkedin_social",
      key,
      userId: req.session.user.id,
      appId: "linkedin-social",
      avatarUrl: user?.picture,
      name: user?.name,
      emailOrUserName: user?.email,
      isUserCurrentProfile: true,
      currentPageId: `urn:li:person:${user.sub}`,
    };
    const id = existed?.id ?? 0;

    await prisma.credential.updateMany({
      where: {
        userId: req.session.user.id,
      },
      data: {
        isUserCurrentProfile: false,
        currentPageId: undefined,
      },
    });

    const upsertedRecord = await prisma.credential.upsert({
      where: {
        id,
      },
      create: data,
      update: data,
    });
    await Promise.all(
      pages.map(async (p) =>
        prisma.pageInfo.upsert({
          where: {
            credentialId_id: {
              credentialId: upsertedRecord.id,
              id: p.id,
            },
          },
          create: {
            ...p,
            credentialId: upsertedRecord.id,
            info: p.info,
          },
          update: {
            ...p,
            credentialId: upsertedRecord.id,
            info: p.info,
          },
        })
      )
    );

    await resetCachedSocialProfile(req.session.user.id);

    res.redirect(getInstalledAppPath({ variant: "social", slug: "linkedin-social" }));
  }
}

async function getAccessToken(code: string, app_id: string, app_secret: string, redirectUri: string) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("client_id", app_id);
  params.append("client_secret", app_secret);
  params.append("redirect_uri", redirectUri);
  const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", params);
  return response.data;
}
