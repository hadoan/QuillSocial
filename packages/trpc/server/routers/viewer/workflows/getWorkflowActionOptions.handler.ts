import { getWorkflowActionOptions } from "@quillsocial/features/ee/workflows/lib/getOptions";
import { IS_SELF_HOSTED } from "@quillsocial/lib/constants";
import hasKeyInMetadata from "@quillsocial/lib/hasKeyInMetadata";
import { getTranslation } from "@quillsocial/lib/server/i18n";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";

import { hasTeamPlanHandler } from "../teams/hasTeamPlan.handler";

type GetWorkflowActionOptionsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser> & {
      locale: string;
    };
  };
};

export const getWorkflowActionOptionsHandler = async ({
  ctx,
}: GetWorkflowActionOptionsOptions) => {
  const { user } = ctx;

  const isCurrentUsernamePremium =
    user && hasKeyInMetadata(user, "isPremium")
      ? !!user.metadata.isPremium
      : false;

  let isTeamsPlan = false;
  if (!isCurrentUsernamePremium) {
    const { hasTeamPlan } = await hasTeamPlanHandler({ ctx });
    isTeamsPlan = !!hasTeamPlan;
  }
  const t = await getTranslation(ctx.user.locale, "common");
  return getWorkflowActionOptions(
    t,
    IS_SELF_HOSTED || isCurrentUsernamePremium || isTeamsPlan
  );
};
