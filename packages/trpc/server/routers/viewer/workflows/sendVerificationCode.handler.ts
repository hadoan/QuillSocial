import { sendVerificationCode } from "@quillsocial/features/ee/workflows/lib/reminders/verifyPhoneNumber";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

import type { TSendVerificationCodeInputSchema } from "./sendVerificationCode.schema";

type SendVerificationCodeOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TSendVerificationCodeInputSchema;
};

export const sendVerificationCodeHandler = async ({
  ctx: _ctx,
  input,
}: SendVerificationCodeOptions) => {
  const { phoneNumber } = input;
  return sendVerificationCode(phoneNumber);
};
