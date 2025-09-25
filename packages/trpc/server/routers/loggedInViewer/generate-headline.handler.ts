import { TrpcSessionUser } from "../../trpc";
import type { TGenerateHeadlineInputSchema } from "./generate-headline.schema";
import { generateHeadline } from "@quillsocial/app-store/chatgptai/lib/completions/generate-headline";
import { prisma } from "@quillsocial/prisma";
import type { NextApiResponse, GetServerSidePropsContext } from "next";
import type { Session } from "next-auth";

type UpdateHeadlineGeneratorOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    res?: NextApiResponse | GetServerSidePropsContext["res"];
  };
  input: TGenerateHeadlineInputSchema;
};

export const generateHeadlineHandler = async ({
  ctx,
  input,
}: UpdateHeadlineGeneratorOptions) => {
  const { user } = ctx;
  const id = user?.id || undefined;
  if (id) {
    const dbUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userExtraData: true,
        userExtraDataId: true,
      },
    });
    const userExtraDataId = await prisma.userExtraData.upsert({
      where: {
        id: dbUser?.userExtraDataId || 0,
      },
      update: {
        cv: input.cv,
      },
      create: {
        cv: input.cv,
      },
      select: {
        id: true,
      },
    });
    if (!dbUser?.userExtraDataId) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          userExtraDataId: userExtraDataId?.id,
        },
      });
    }
  }

  const response = await generateHeadline(user.id, input.cv);
  return response;
};
