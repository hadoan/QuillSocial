import type { TCreateInviteInputSchema } from "./createInvite.schema";
import { isTeamAdmin } from "@quillsocial/lib/server/queries/teams";
import { prisma } from "@quillsocial/prisma";
import { TRPCError } from "@quillsocial/trpc/server";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import { randomBytes } from "crypto";

type CreateInviteOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TCreateInviteInputSchema;
};

export const createInviteHandler = async ({
  ctx,
  input,
}: CreateInviteOptions) => {
  const { teamId } = input;

  if (!(await isTeamAdmin(ctx.user.id, teamId)))
    throw new TRPCError({ code: "UNAUTHORIZED" });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: "",
      token,
      expires: new Date(),
      teamId,
    },
  });
  return token;
};
