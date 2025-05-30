import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { EmptyScreen } from "@quillsocial/ui";
import { AlertCircle } from "@quillsocial/ui/components/icon";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { ComponentProps } from "react";
import React from "react";

type AppsLayoutProps = {
  children: React.ReactNode;
  actions?: (className?: string) => JSX.Element;
  emptyStore?: boolean;
} & Omit<ComponentProps<typeof Shell>, "actions">;

export default function AppsLayout({
  children,
  actions,
  emptyStore,
  ...rest
}: AppsLayoutProps) {
  const { t } = useLocale();
  const session = useSession();
  const router = useRouter();
  const isAdmin = session.data?.user.role === "ADMIN";

  if (session.status === "loading") return <></>;
  return (
    <Shell {...rest} actions={actions?.("block")} hideHeadingOnMobile>
      <div className="flex flex-col xl:flex-row">
        <main className="w-full">
          {emptyStore ? (
            <EmptyScreen
              Icon={AlertCircle}
              headline={isAdmin ? t("no_apps") : t("no_apps_configured")}
              description={
                isAdmin ? t("enable_in_settings") : t("please_contact_admin")
              }
              buttonText={isAdmin ? t("apps_settings") : ""}
              buttonOnClick={() => router.push("/settings/admin/apps/calendar")}
            />
          ) : (
            <>{children}</>
          )}
        </main>
      </div>
    </Shell>
  );
}
export const getLayout = (page: React.ReactElement) => (
  <AppsLayout>{page}</AppsLayout>
);
