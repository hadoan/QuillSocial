import type { TVerifyPhoneNumberInputSchema } from "./verifyPhoneNumber.schema";
import { verifyPhoneNumber } from "@quillsocial/features/ee/workflows/lib/reminders/verifyPhoneNumber";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

type VerifyPhoneNumberOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TVerifyPhoneNumberInputSchema;
};

export const verifyPhoneNumberHandler = async ({
  ctx,
  input,
}: VerifyPhoneNumberOptions) => {
  const { phoneNumber, code, teamId } = input;
  const { user } = ctx;
  const verifyStatus = await verifyPhoneNumber(
    phoneNumber,
    code,
    user.id,
    teamId
  );
  return verifyStatus;
};
