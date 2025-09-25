import { IS_SELF_HOSTED } from "../constants";
import hasKeyInMetadata from "../hasKeyInMetadata";
import { trpc } from "@quillsocial/trpc/react";

export function useHasPaidPlan() {
  if (IS_SELF_HOSTED) return { isLoading: false, hasPaidPlan: true };

  const { data: user, isLoading: isLoadingUserQuery } =
    trpc.viewer.me.useQuery();

  const isCurrentUsernamePremium =
    user && hasKeyInMetadata(user, "isPremium")
      ? !!user.metadata.isPremium
      : false;

  return { isLoading: false, hasPaidPlan: false };
}

export function useTeamInvites() {
  return { isLoading: false, listInvites: true };
}

export function useHasTeamPlan() {
  return { isLoading: false, hasTeamPlan: false };
}

export default useHasPaidPlan;
