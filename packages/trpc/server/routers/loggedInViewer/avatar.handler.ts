import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

type AvatarOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const avatarHandler = async ({ ctx }: AvatarOptions) => {
  return {
    avatar: ctx.user.rawAvatar,
  };
};
