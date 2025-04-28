import { TWITTER_APP_ID } from "@quillsocial/lib/constants";
import prisma from "@quillsocial/prisma";
import { IdentityProvider } from "@quillsocial/prisma/enums";

export const updateUserCredential = async (
  provider: IdentityProvider,
  userId: number,
  emailOrUserName: string,
  userFullName: string,
  avatarUrl: string,
  scopes: string[],
  expires_at: number,
  access_token: string,
  refresh_token: string
) => {
  const existedCredentials = await prisma.credential.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      emailOrUserName: true,
      appId: true,
      isUserCurrentProfile: true,
    },
  });

  const token = {
    scope: scopes,
    token_type: "bearer",
    expires_at,
    access_token,
  };

  const key =
    provider === IdentityProvider.LINKEDIN
      ? {
          token: {
            ...token,
            id_token: refresh_token,
          },
        }
      : {
          token: {
            ...token,
            refresh_token,
          },
        };

  const appId = provider === IdentityProvider.TWITTER ? TWITTER_APP_ID : provider.toLocaleLowerCase() + "-social";
  const existed = existedCredentials?.find((x) => x.appId === appId && x.emailOrUserName == emailOrUserName);
  const data = {
    type: appId.replace("-", "_"),
    key,
    userId,
    appId,
    avatarUrl,
    name: userFullName,
    emailOrUserName,
  };

  const id = existed?.id ?? 0;
  let isUserCurrentProfile: boolean | null =
    !existedCredentials || existedCredentials.length === 0 ? true : false;
  if (existed) {
    isUserCurrentProfile = existed.isUserCurrentProfile;
  }
  await prisma.credential.upsert({
    where: {
      id,
    },
    create: {
      ...data,
      isUserCurrentProfile,
    },
    update: data,
  });
};
