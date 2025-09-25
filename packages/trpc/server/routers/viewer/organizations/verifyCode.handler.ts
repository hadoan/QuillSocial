import type { ZVerifyCodeInputSchema } from "./verifyCode.schema";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";
import { totp } from "otplib";

type VerifyCodeOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: ZVerifyCodeInputSchema;
};

export const verifyCodeHandler = async ({ ctx, input }: VerifyCodeOptions) => {
  const { email, code } = input;
  const { user } = ctx;

  if (!user || !email || !code) throw new TRPCError({ code: "BAD_REQUEST" });

  const secret = createHash("md5")
    .update(email + process.env.MY_APP_ENCRYPTION_KEY)
    .digest("hex");

  totp.options = { step: 900 };
  const isValidToken = totp.check(code, secret);

  if (!isValidToken)
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalid_code" });

  return isValidToken;
};
