import type { TCreateInputSchema } from "./create.schema";
import { prisma } from "@quillsocial/prisma";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import { v4 } from "uuid";

type CreateOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TCreateInputSchema;
};

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  if (input.eventTypeId || input.teamId) {
    return await prisma.webhook.create({
      data: {
        id: v4(),
        ...input,
      },
    });
  }

  return await prisma.webhook.create({
    data: {
      id: v4(),
      userId: ctx.user.id,
      ...input,
    },
  });
};
