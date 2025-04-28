import { useTeamInvites } from "@quillsocial/lib/hooks/useHasPaidPlan";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Badge } from "@quillsocial/ui";

export function TeamInviteBadge() {
  const { isLoading, listInvites } = useTeamInvites();
  const { t } = useLocale();

  if (isLoading || !listInvites) return null;

  return <Badge variant="default">{t("invite_team_notifcation_badge")}</Badge>;
}
