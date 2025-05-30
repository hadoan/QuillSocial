import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ComponentProps } from "react";
import React, { Suspense, useEffect, useState } from "react";

import Shell from "@quillsocial/features/shell/Shell";
import { classNames } from "@quillsocial/lib";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { IdentityProvider } from "@quillsocial/prisma/enums";
import { UserPermissionRole } from "@quillsocial/prisma/enums";
import { trpc } from "@quillsocial/trpc/react";
import useAvatarQuery from "@quillsocial/trpc/react/hooks/useAvatarQuery";
import type { VerticalTabItemProps } from "@quillsocial/ui";
import {
  Button,
  ErrorBoundary,
  Skeleton,
  useMeta,
  VerticalTabItem,
} from "@quillsocial/ui";
import {
  User,
  Key,
  CreditCard,
  Terminal,
  Users,
  Loader,
  Lock,
  ArrowLeft,
  Menu,
  Building,
} from "@quillsocial/ui/components/icon";

const tabs: VerticalTabItemProps[] = [
  {
    name: "my_account",
    href: "/settings/my-account",
    icon: User,
    children: [
      { name: "profile", href: "/settings/my-account/profile" },
      { name: "general", href: "/settings/my-account/general" },
      { name: "calendars", href: "/settings/my-account/calendars" },
      { name: "conferencing", href: "/settings/my-account/conferencing" },
      { name: "appearance", href: "/settings/my-account/appearance" },
      // TODO
      // { name: "referrals", href: "/settings/my-account/referrals" },
    ],
  },
  {
    name: "security",
    href: "/settings/security",
    icon: Key,
    children: [
      { name: "password", href: "/settings/security/password" },
      { name: "impersonation", href: "/settings/security/impersonation" },
      { name: "2fa_auth", href: "/settings/security/two-factor-auth" },
    ],
  },
  {
    name: "billing",
    href: "/settings/billing",
    icon: CreditCard,
    children: [{ name: "manage_billing", href: "/settings/billing" }],
  },
  {
    name: "developer",
    href: "/settings/developer",
    icon: Terminal,
    children: [
      //
      { name: "webhooks", href: "/settings/developer/webhooks" },
      { name: "api_keys", href: "/settings/developer/api-keys" },
      // TODO: Add profile level for embeds
      // { name: "embeds", href: "/v2/settings/developer/embeds" },
    ],
  },
  {
    name: "organization",
    href: "/settings/organizations",
    icon: Building,
    children: [
      {
        name: "profile",
        href: "/settings/organizations/profile",
      },
      {
        name: "general",
        href: "/settings/organizations/general",
      },
      {
        name: "members",
        href: "/settings/organizations/members",
      },
      {
        name: "appearance",
        href: "/settings/organizations/appearance",
      },
      {
        name: "billing",
        href: "/settings/organizations/billing",
      },
    ],
  },
  {
    name: "teams",
    href: "/settings/teams",
    icon: Users,
    children: [],
  },
  {
    name: "admin",
    href: "/settings/admin",
    icon: Lock,
    children: [
      //
      { name: "features", href: "/settings/admin/flags" },
      { name: "license", href: "/auth/setup?step=1" },
      { name: "impersonation", href: "/settings/admin/impersonation" },
      { name: "apps", href: "/settings/admin/apps/calendar" },
      { name: "users", href: "/settings/admin/users" },
      { name: "organizations", href: "/settings/admin/organizations" },
    ],
  },
];

tabs.find((tab) => {
  // Add "SAML SSO" to the tab
  if (tab.name === "security") {
    tab.children?.push({
      name: "sso_configuration",
      href: "/settings/security/sso",
    });
  }
});

// The following keys are assigned to admin only
const adminRequiredKeys = ["admin"];
const organizationRequiredKeys = ["organization"];

const useTabs = () => {
  const session = useSession();
  const { data: user } = trpc.viewer.me.useQuery();
  const { data: avatar } = useAvatarQuery();

  const isAdmin = session.data?.user.role === UserPermissionRole.ADMIN;

  tabs.map((tab) => {
    if (tab.href === "/settings/my-account") {
      tab.name = user?.name || "my_account";
      tab.icon = undefined;
      tab.avatar =
        avatar?.avatar ||
        WEBAPP_URL + "/" + session?.data?.user?.username + "/avatar.png";
    } else if (
      tab.href === "/settings/security" &&
      user?.identityProvider === IdentityProvider.GOOGLE
    ) {
      tab.children = tab?.children?.filter(
        (childTab) => childTab.href !== "/settings/security/two-factor-auth"
      );
    }
    return tab;
  });

  // check if name is in adminRequiredKeys
  return tabs.filter((tab) => {
    if (organizationRequiredKeys.includes(tab.name))
      return !!session.data?.user?.organizationId;

    if (isAdmin) return true;
    return !adminRequiredKeys.includes(tab.name);
  });
};

const BackButtonInSidebar = ({ name }: { name: string }) => {
  return (
    <Link
      href="/"
      className="hover:bg-subtle [&[aria-current='page']]:bg-emphasis [&[aria-current='page']]:text-emphasis group-hover:text-default text-emphasis group my-6 flex h-6 max-h-6 w-full flex-row items-center rounded-md px-3 py-2 text-sm font-medium leading-4"
      data-testid={`vertical-tab-${name}`}
    >
      <ArrowLeft className="h-4 w-4 stroke-[2px] md:mt-0 ltr:mr-[10px] rtl:ml-[10px] rtl:rotate-180" />
      <Skeleton
        title={name}
        as="p"
        className="min-h-4 max-w-36 truncate"
        loadingClassName="ms-3"
      >
        {name}
      </Skeleton>
    </Link>
  );
};

interface SettingsSidebarContainerProps {
  className?: string;
  navigationIsOpenedOnMobile?: boolean;
}

const SettingsSidebarContainer = ({
  className = "",
  navigationIsOpenedOnMobile,
}: SettingsSidebarContainerProps) => {
  const { t } = useLocale();
  const router = useRouter();
  const tabsWithPermissions = useTabs();
  const [teamMenuState, setTeamMenuState] =
    useState<{ teamId: number | undefined; teamMenuOpen: boolean }[]>();

  return (
    <nav
      className={classNames(
        "no-scrollbar bg-muted fixed bottom-0 left-0 top-0 z-20 flex max-h-screen w-56 flex-col space-y-1 overflow-x-hidden overflow-y-scroll px-2 pb-3 transition-transform max-lg:z-10 lg:sticky lg:flex",
        className,
        navigationIsOpenedOnMobile
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100"
      )}
      aria-label="Tabs"
    >
      <>
        <BackButtonInSidebar name={t("back")} />
        {tabsWithPermissions.map((tab) => {
          return tab.name !== "teams" ? (
            <React.Fragment key={tab.href}>
              <div className={`${!tab.children?.length ? "!mb-3" : ""}`}>
                <div className="[&[aria-current='page']]:bg-emphasis [&[aria-current='page']]:text-emphasis text-default group flex h-9 w-full flex-row items-center rounded-md px-2 text-sm font-medium leading-none">
                  {tab && tab.icon && (
                    <tab.icon className="h-[16px] w-[16px] stroke-[2px] md:mt-0 ltr:mr-3 rtl:ml-3" />
                  )}
                  {!tab.icon && tab?.avatar && (
                    <img
                      className="h-4 w-4 rounded-full ltr:mr-3 rtl:ml-3"
                      src={tab?.avatar}
                      alt="User Avatar"
                    />
                  )}
                  <Skeleton
                    title={tab.name}
                    as="p"
                    className="truncate text-sm font-medium leading-5"
                    loadingClassName="ms-3"
                  >
                    {t(tab.name)}
                  </Skeleton>
                </div>
              </div>
              <div className="my-3 space-y-0.5">
                {tab.children?.map((child, index) => (
                  <VerticalTabItem
                    key={child.href}
                    name={t(child.name)}
                    isExternalLink={child.isExternalLink}
                    href={child.href || "/"}
                    textClassNames="px-3 text-emphasis font-medium text-sm"
                    className={`my-0.5 h-7 ${
                      tab.children &&
                      index === tab.children?.length - 1 &&
                      "!mb-3"
                    }`}
                    disableChevron
                  />
                ))}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key={tab.href}>
              <div className={`${!tab.children?.length ? "mb-3" : ""}`}>
                <Link href={tab.href}>
                  <div className="hover:bg-subtle [&[aria-current='page']]:bg-emphasis [&[aria-current='page']]:text-emphasis group-hover:text-default text-default group flex h-9 w-full flex-row items-center rounded-md px-2 py-[10px]  text-sm font-medium leading-none">
                    {tab && tab.icon && (
                      <tab.icon className="h-[16px] w-[16px] stroke-[2px] md:mt-0 ltr:mr-3 rtl:ml-3" />
                    )}
                    <Skeleton
                      title={tab.name}
                      as="p"
                      className="truncate text-sm font-medium leading-5"
                      loadingClassName="ms-3"
                    >
                      {t(tab.name)}
                    </Skeleton>
                  </div>
                </Link>
              </div>
            </React.Fragment>
          );
        })}
      </>
    </nav>
  );
};

const MobileSettingsContainer = (props: {
  onSideContainerOpen?: () => void;
}) => {
  const { t } = useLocale();
  const router = useRouter();

  return (
    <>
      <nav className="bg-muted border-muted sticky top-0 z-20 flex w-full items-center justify-between border-b py-2 sm:relative lg:hidden">
        <div className="flex items-center space-x-3 ">
          <Button
            StartIcon={Menu}
            color="minimal"
            variant="icon"
            onClick={props.onSideContainerOpen}
          >
            <span className="sr-only">{t("show_navigation")}</span>
          </Button>

          <button
            className="hover:bg-emphasis flex items-center space-x-2 rounded-md px-3 py-1 rtl:space-x-reverse"
            onClick={() => router.back()}
          >
            <ArrowLeft className="text-default h-4 w-4" />
            <p className="text-emphasis font-semibold">{t("settings")}</p>
          </button>
        </div>
      </nav>
    </>
  );
};

export default function SettingsLayout({
  children,
  ...rest
}: { children: React.ReactNode } & ComponentProps<typeof Shell>) {
  const router = useRouter();
  const state = useState(false);
  const { t } = useLocale();
  const [sideContainerOpen, setSideContainerOpen] = state;

  useEffect(() => {
    const closeSideContainer = () => {
      if (window.innerWidth >= 1024) {
        setSideContainerOpen(false);
      }
    };

    window.addEventListener("resize", closeSideContainer);
    return () => {
      window.removeEventListener("resize", closeSideContainer);
    };
  }, []);

  useEffect(() => {
    if (sideContainerOpen) {
      setSideContainerOpen(!sideContainerOpen);
    }
  }, [router.asPath]);

  return (
    <Shell
      withoutSeo={true}
      flexChildrenContainer
      hideHeadingOnMobile
      {...rest}
      SidebarContainer={
        <>
          {/* Mobile backdrop */}
          {sideContainerOpen && (
            <button
              onClick={() => setSideContainerOpen(false)}
              className="fixed left-0 top-0 z-10 h-full w-full bg-black/50"
            >
              <span className="sr-only">{t("hide_navigation")}</span>
            </button>
          )}
          <SettingsSidebarContainer
            navigationIsOpenedOnMobile={sideContainerOpen}
          />
        </>
      }
      drawerState={state}
      MobileNavigationContainer={null}
      TopNavContainer={
        <MobileSettingsContainer
          onSideContainerOpen={() => setSideContainerOpen(!sideContainerOpen)}
        />
      }
    >
      <div className="flex flex-1 [&>*]:flex-1">
        <div className="mx-auto max-w-full justify-center md:max-w-3xl">
          <ShellHeader />
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>{children}</Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </Shell>
  );
}

export const getLayout = (page: React.ReactElement) => (
  <SettingsLayout>{page}</SettingsLayout>
);

function ShellHeader() {
  const { meta } = useMeta();
  const { t, isLocaleReady } = useLocale();
  return (
    <header className="mx-auto block justify-between pt-8 sm:flex">
      <div className="border-subtle mb-8 flex w-full items-center pb-1">
        {meta.backButton && (
          <a href="javascript:history.back()">
            <ArrowLeft className="mr-7" />
          </a>
        )}
        <div>
          {meta.title && isLocaleReady ? (
            <h1 className="font-quill text-emphasis mb-1 text-xl font-bold leading-5 tracking-wide">
              {t(meta.title)}
            </h1>
          ) : (
            <div className="bg-emphasis mb-1 h-6 w-24 animate-pulse rounded-md" />
          )}
          {meta.description && isLocaleReady ? (
            <p className="text-default text-sm ltr:mr-4 rtl:ml-4">
              {t(meta.description)}
            </p>
          ) : (
            <div className="bg-emphasis mb-1 h-6 w-32 animate-pulse rounded-md" />
          )}
        </div>
        <div className="ms-auto flex-shrink-0">{meta.CTA}</div>
      </div>
    </header>
  );
}
