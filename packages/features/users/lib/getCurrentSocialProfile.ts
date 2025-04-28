import { WEBAPP_URL } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";

export const getCurrentSocialProfile = async (userId: number) => {
  let pageId = undefined;
  let credential: any = await prisma.credential.findFirst({
    where: {
      userId,
      isUserCurrentProfile: true,
    },
  });
  if (!credential) {
    credential = await prisma.credential.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
        avatarUrl: true,
        emailOrUserName: true,
        name: true,
        appId: true,
        currentPageId: true,
        pageInfoes: {
          select: {
            id: true
          }
        }
      }
    });
    pageId = credential?.pageInfoes && credential.pageInfoes.length > 0 ? credential.pageInfoes[0].id : undefined;
  } else {
    pageId = credential.currentPageId;
  }
  return {
    credentialId: credential?.id,
    avatarUrl: credential?.avatarUrl ?? WEBAPP_URL + "/img/logo.png",
    emailOrUserName: credential?.emailOrUserName ?? "john.doe@example.com",
    name: credential?.name ?? "Your Name",
    appId: credential?.appId!,
    pageId
  };
};
