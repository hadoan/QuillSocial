import { TrpcSessionUser } from "../../trpc";
import type { TGenerateAboutInputSchema } from "./generate-about.schema";
import { generateAbout } from "@quillsocial/app-store/chatgptai/lib/completions/generate-about";
import { prisma } from "@quillsocial/prisma";
import type { NextApiResponse, GetServerSidePropsContext } from "next";
import type { Session } from "next-auth";

type UpdateAboutGeneratorOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    res?: NextApiResponse | GetServerSidePropsContext["res"];
  };
  input: TGenerateAboutInputSchema;
};

export const generateAboutHandler = async ({
  ctx,
  input,
}: UpdateAboutGeneratorOptions) => {
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

  const response = await generateAbout(user.id, input.cv);
  return response;
};
