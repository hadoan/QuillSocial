import type { TSendVerificationCodeInputSchema } from "./sendVerificationCode.schema";
import { sendVerificationCode } from "@quillsocial/features/ee/workflows/lib/reminders/verifyPhoneNumber";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

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
