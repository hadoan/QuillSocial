import { TrpcSessionUser } from "../../../trpc";
import { prisma } from "@quillsocial/prisma";

type GetSocialOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const getSocialHanlder = async ({ ctx }: GetSocialOptions) => {
  const userId = ctx.user.id;
  if (!ctx.user || !ctx.user.id) {
    throw new Error("Invalid user");
  }

  const credentials = await prisma.credential.findMany({
    where: {
      userId: userId,
      app: {
        slug: {
          endsWith: "-social",
        },
      },
    },
    select: {
      id: true,
      appId: true,
      emailOrUserName: true,
      userId: true,
      name: true,
      avatarUrl: true,
      isUserCurrentProfile: true,
      currentPageId: true,
      pageInfoes: {
        select: {
          id: true,
          name: true,
          isCurrent: true,
          info: true,
        },
      },
    },
  });
  if (credentials.length === 0) {
    return [];
  } else {
    const listCredentials: any[] = [];
    credentials.forEach((credential) => {
      if (
        credential.appId === "x-social" ||
        !credential.pageInfoes ||
        credential.pageInfoes.length == 0
      ) {
        listCredentials.push(credential);
      } else {
        const pageCredentials = credential.pageInfoes.map((p) => {
          // For Instagram, display both name and username if available
          let displayName = p.name;
          if (credential.appId === "instagram-social" && (p.info as any)?.username) {
            displayName = `${p.name} (@${(p.info as any).username})`;
          }

          return {
            ...credential,
            id: credential.id,
            pageId: p.id,
            name: displayName,
            avatarUrl:
              credential.appId === "facebook-social"
                ? (p.info as any)?.picture?.data?.url ?? credential.avatarUrl
                : credential.avatarUrl,
            isUserCurrentProfile: credential.isUserCurrentProfile
              ? p.id === credential.currentPageId
              : false,
          };
        });
        listCredentials.push(...pageCredentials);
      }
    });
    return listCredentials;
  }
};
