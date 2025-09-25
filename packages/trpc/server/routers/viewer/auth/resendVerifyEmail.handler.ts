import type { TrpcSessionUser } from "../../../trpc";
import { sendEmailVerification } from "@quillsocial/features/auth/lib/verifyEmail";
import logger from "@quillsocial/lib/logger";

type ResendEmailOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

const log = logger.getChildLogger({ prefix: [`[[Auth] `] });

export const resendVerifyEmail = async ({ ctx }: ResendEmailOptions) => {
  if (ctx.user.emailVerified) {
    log.info(`User ${ctx.user.id} already verified email`);
    return {
      ok: true,
      skipped: true,
    };
  }

  const email = await sendEmailVerification({
    email: ctx.user.email,
    username: ctx.user?.username ?? undefined,
    language: ctx.user.locale,
  });

  return email;
};
