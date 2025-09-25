import type { TEditInputSchema } from "./edit.schema";
import { prisma } from "@quillsocial/prisma";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

type EditOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TEditInputSchema;
};

export const editHandler = async ({ input }: EditOptions) => {
  const { id, ...data } = input;

  const webhook = await prisma.webhook.findFirst({
    where: {
      id,
    },
  });

  if (!webhook) {
    return null;
  }
  return await prisma.webhook.update({
    where: {
      id,
    },
    data,
  });
};
