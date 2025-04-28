import { prisma } from "@quillsocial/prisma";
import { TrpcSessionUser } from "../../../trpc";
import { PostStatus } from "@quillsocial/prisma/client";
type GetSocialConditionsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const getSocialConditionsForBillingHanlder = async ({ ctx }: GetSocialConditionsOptions) => {
const userId = ctx.user.id;
  if (!ctx.user || !ctx.user.id) {
    throw new Error("Invalid user");
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);


  const countPost = await prisma.post.count({
    where:
    {
      userId: userId,
      createdDate: {
        gte: startOfMonth,
        lte:endOfMonth
      }
    }
  });
  
  const accounts = await prisma.credential.findMany({
    where:
    {
      userId: userId,
    },
    select: {
      id: true,
      appId: true,
      emailOrUserName: true,
    },
  });
  const countAccount = accounts.length > 0 ? accounts.length : 0;
  return  {
    countAccount,
    countPost,
  }
};
