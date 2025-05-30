import SettingsLayout from "@quillsocial/features/settings/layouts/SettingsLayout";
import type Shell from "@quillsocial/features/shell/Shell";
import { UserPermissionRole } from "@quillsocial/prisma/enums";
import { ErrorBoundary } from "@quillsocial/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { ComponentProps } from "react";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,

  ...rest
}: { children: React.ReactNode } & ComponentProps<typeof Shell>) {
  const session = useSession();
  const router = useRouter();

  // Force redirect on component level
  useEffect(() => {
    if (session.data && session.data.user.role !== UserPermissionRole.ADMIN) {
      router.replace("/settings/my-account/profile");
    }
  }, [session, router]);

  const isAppsPage = router.asPath.startsWith("/settings/admin/apps");
  return (
    <SettingsLayout {...rest}>
      <div className="divide-subtle mx-auto flex max-w-4xl flex-row divide-y">
        <div className={isAppsPage ? "min-w-0" : "flex flex-1 [&>*]:flex-1"}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </div>
    </SettingsLayout>
  );
}

export const getLayout = (page: React.ReactElement) => (
  <AdminLayout>{page}</AdminLayout>
);
