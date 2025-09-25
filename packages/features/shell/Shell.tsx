import { redirectIfTrialOver } from "../payments/redirectIfTrialOver";
import { ModalAccount } from "./SocialAccountsDialog";
import SocialAvatar from "./SocialAvatar";
import { BillingNotifications } from "./components/BillingNotifications";
import useAddAppMutation from "@quillsocial/app-store/_utils/useAddAppMutation";
import dayjs from "@quillsocial/dayjs";
import {
  KBarContent,
  KBarRoot,
  KBarTrigger,
} from "@quillsocial/features/kbar/Kbar";
import ReminderDaysBilling from "@quillsocial/features/payments/ConstRemindDays";
import TimezoneChangeDialog from "@quillsocial/features/settings/TimezoneChangeDialog";
import { useCurrentUserAccount } from "@quillsocial/features/shell/SocialAvatar";
import AdminPasswordBanner from "@quillsocial/features/users/components/AdminPasswordBanner";
import VerifyEmailBanner from "@quillsocial/features/users/components/VerifyEmailBanner";
import classNames from "@quillsocial/lib/classNames";
import { APP_NAME, WEBAPP_URL } from "@quillsocial/lib/constants";
import getBrandColours from "@quillsocial/lib/getBrandColours";
import { useIsomorphicLayoutEffect } from "@quillsocial/lib/hooks/useIsomorphicLayoutEffect";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import type { User } from "@quillsocial/prisma/client";
import { trpc } from "@quillsocial/trpc/react";
import useAvatarQuery from "@quillsocial/trpc/react/hooks/useAvatarQuery";
import useEmailVerifyCheck from "@quillsocial/trpc/react/hooks/useEmailVerifyCheck";
import useMeQuery from "@quillsocial/trpc/react/hooks/useMeQuery";
import type { SVGComponent } from "@quillsocial/types/SVGComponent";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HeadSeo,
  Logo,
  SkeletonText,
  Tooltip,
  showToast,
  useAppDefaultTheme,
  ErrorBoundary,
} from "@quillsocial/ui";
import {
  ArrowLeft,
  ArrowRight,
  FileClock,
  Wand,
  Lightbulb,
  ExternalLink,
  LogOut,
  CreditCard,
  Copy,
  Settings,
  Users,
  User as UserIcon,
  CalendarDays,
  ListChecks,
  BarChart,
  Atom,
  BarChart3,
  PenTool,
  LinkedinIcon,
  Newspaper,
  Linkedin,
  BookOpen,
} from "@quillsocial/ui/components/icon";
import type { User as UserAuth } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import type { NextRouter } from "next/router";
import { useRouter } from "next/router";
import router from "next/router";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { Toaster } from "react-hot-toast";

export const ONBOARDING_INTRODUCED_AT = dayjs("September 1 2021").toISOString();

export const ONBOARDING_NEXT_REDIRECT = {
  redirect: {
    permanent: false,
    destination: "/getting-started",
  },
} as const;

export const shouldShowOnboarding = (
  user: Pick<User, "createdDate" | "completedOnboarding" | "organizationId">
) => {
  return (
    !user.completedOnboarding &&
    !user.organizationId &&
    dayjs(user.createdDate).isAfter(ONBOARDING_INTRODUCED_AT)
  );
};

function useRedirectToLoginIfUnauthenticated(isPublic = false) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();

  useEffect(() => {
    if (isPublic) {
      return;
    }

    // Don't redirect if we're on any navigation path or auth pages
    const currentPath = router.pathname;
    const shouldSkipRedirect = NAVIGATION_PATHS.some(path =>
      currentPath.startsWith(path)
    );

    if (shouldSkipRedirect) {
      return;
    }

    if (!loading && !session) {
      router.replace({
        pathname: "/auth/login",
        query: {
          callbackUrl: `${WEBAPP_URL}${location.pathname}${location.search}`,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, isPublic]);

  return {
    loading: loading && !session,
    session,
  };
}

function useRedirectToOnboardingIfNeeded() {
  const router = useRouter();
  const query = useMeQuery();
  const user = query.data;
  // const flags = useFlagMap();

  const { data: email } = useEmailVerifyCheck();

  const needsEmailVerification = !email?.isVerified;

  const isRedirectingToOnboarding = user && shouldShowOnboarding(user);

  useEffect(() => {
    // Don't redirect if we're on any navigation path, auth pages, or onboarding
    const currentPath = router.pathname;
    const shouldSkipRedirect = NAVIGATION_PATHS.some(path =>
      currentPath.startsWith(path)
    );

    if (shouldSkipRedirect) {
      return;
    }

    if (isRedirectingToOnboarding && !needsEmailVerification) {
      router.replace({
        pathname: "/getting-started",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRedirectingToOnboarding, needsEmailVerification]);

  return {
    isRedirectingToOnboarding,
  };
}

const Layout = (props: LayoutProps) => {
  const pageTitle =
    typeof props.heading === "string" && !props.title
      ? props.heading
      : props.title;
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [bannersHeight, setBannersHeight] = useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const { offsetHeight } = entries[0].target as HTMLElement;
      setBannersHeight(offsetHeight);
    });

    const currentBannerRef = bannerRef.current;

    if (currentBannerRef) {
      resizeObserver.observe(currentBannerRef);
    }

    return () => {
      if (currentBannerRef) {
        resizeObserver.unobserve(currentBannerRef);
      }
    };
  }, [bannerRef]);

  // const navItems = redirectIfTrialOver(mobileNavigationBottomItems, desktopNavigationItems);
  // mobileNavigationBottomItems = navItems.mobileNavigationBottomItems;
  // desktopNavigationItems = navItems.desktopNavigationItems;

  const { isLoading, data: user } = useMeQuery();
  const { isLoading: accountsLoading, data: accounts } =
    trpc.viewer.socials.getSocialNetWorking.useQuery();
  const currentUser =
    !accountsLoading &&
    accounts &&
    (accounts.find((account) => account.isUserCurrentProfile) || accounts[0]); // Fallback to first account

  const { isLoading: isCheckPricingLoading, data: pricingData } =
    trpc.viewer.teams.checkPricingTeam.useQuery();
  if (!isCheckPricingLoading && !isLoading && user) {
    if (pricingData) {
      if (
        pricingData?.day === ReminderDaysBilling.END_REMINDER &&
        pricingData?.isRemind
      ) {
        mobileNavigationBottomItems = mobileNavigationBottomItems.filter(
          (x) =>
            x.name.toLowerCase() === "billing" ||
            x.name.toLowerCase() === "employees"
        );
        desktopNavigationItems = desktopNavigationItems.filter(
          (x) =>
            x.name.toLowerCase() === "billing" ||
            x.name.toLowerCase() === "employees"
        );
        const currentUrl = router.asPath;
        if (
          !(currentUrl.includes("billing") || currentUrl.includes("employee"))
        ) {
          router.push("/billing/overview");
        }
      }
    }
  }

  return (
    <>
      {!props.withoutSeo && (
        <HeadSeo
          title={pageTitle ?? APP_NAME}
          description={props.subtitle ? props.subtitle?.toString() : ""}
        />
      )}
      <div>
        <Toaster position="bottom-right" />
      </div>

      {/* todo: only run this if timezone is different */}
      <TimezoneChangeDialog />
      <div className="flex min-h-screen flex-col">
        <div
          ref={bannerRef}
          className="sticky top-0 z-10 w-full divide-y divide-black"
        >
          {/* <TeamsUpgradeBanner />
          <OrgUpgradeBanner />
          <ImpersonatingBanner /> */}

          {pricingData && (
            <BillingNotifications
              pricingData={pricingData}
            ></BillingNotifications>
          )}

          <AdminPasswordBanner />
          <VerifyEmailBanner />
        </div>
        <div className="flex flex-1" data-testid="dashboard-shell">
          {props.SidebarContainer ||
            (!accountsLoading && (
              <SideBarContainer
                user={user}
                currentUser={currentUser}
                bannersHeight={bannersHeight}
              />
            ))}
          <div className="flex w-0 flex-1 flex-col">
            <MainContainer {...props} />
          </div>
        </div>
      </div>
    </>
  );
};

type DrawerState = [
  isOpen: boolean,
  setDrawerOpen: Dispatch<SetStateAction<boolean>>
];

type LayoutProps = {
  centered?: boolean;
  title?: string;
  heading?: ReactNode;
  subtitle?: ReactNode;
  headerClassName?: string;
  children: ReactNode;
  CTA?: ReactNode;
  large?: boolean;
  MobileNavigationContainer?: ReactNode;
  SidebarContainer?: ReactNode;
  TopNavContainer?: ReactNode;
  drawerState?: DrawerState;
  HeadingLeftIcon?: ReactNode;
  backPath?: string | boolean; // renders back button to specified path
  // use when content needs to expand with flex
  flexChildrenContainer?: boolean;
  isPublic?: boolean;
  withoutMain?: boolean;
  // Gives you the option to skip HeadSEO and render your own.
  withoutSeo?: boolean;
  // Gives the ability to include actions to the right of the heading
  actions?: JSX.Element;
  beforeCTAactions?: JSX.Element;
  afterHeading?: ReactNode;
  smallHeading?: boolean;
  hideHeadingOnMobile?: boolean;
};

const useBrandColors = () => {
  const { data: user } = useMeQuery();
  const brandTheme = getBrandColours({
    lightVal: user?.brandColor,
    darkVal: user?.darkBrandColor,
  });
  useAppDefaultTheme(brandTheme);
};

const KBarWrapper = ({
  children,
  withKBar = false,
}: {
  withKBar: boolean;
  children: React.ReactNode;
}) =>
  withKBar ? (
    <KBarRoot>
      {children}
      <KBarContent />
    </KBarRoot>
  ) : (
    <>{children}</>
  );

const PublicShell = (props: LayoutProps) => {
  const { status } = useSession();
  return (
    <KBarWrapper withKBar={status === "authenticated"}>
      <Layout {...props} />
    </KBarWrapper>
  );
};

export default function Shell(props: LayoutProps) {
  // if a page is unauthed and isPublic is true, the redirect does not happen.
  useRedirectToLoginIfUnauthenticated(props.isPublic);
  useRedirectToOnboardingIfNeeded();
  // System Theme is automatically supported using ThemeProvider. If we intend to use user theme throughout the app we need to uncomment this.
  // useTheme(profile.theme);
  useBrandColors();

  return !props.isPublic ? (
    <KBarWrapper withKBar>
      <Layout {...props} />
    </KBarWrapper>
  ) : (
    <PublicShell {...props} />
  );
}

interface UserDropdownProps {
  small?: boolean;
  currentUser?: any;
}

function UserDropdown({ small, currentUser }: UserDropdownProps) {
  const { t } = useLocale();
  const { data: user } = useMeQuery();
  const { data: avatar } = useAvatarQuery();
  const [showModalAccounts, setShowModalAccounts] = useState(false);
  const handleShowModalMenu = () => {
    setShowModalAccounts(true);
  };
  const handleCloseModalMenu = () => {
    setShowModalAccounts(false);
  };

  useEffect(() => {
    //@ts-ignore
    const Beacon = window.Beacon;
    // window.Beacon is defined when user actually opens up HelpScout and username is available here. On every re-render update session info, so that it is always latest.
    Beacon &&
      Beacon("session-data", {
        username: user?.username || "Unknown",
        screenResolution: `${screen.width}x${screen.height}`,
      });
  });
  // const mutation = trpc.viewer.away.useMutation({
  //   onSettled() {
  //     utils.viewer.me.invalidate();
  //   },
  // });

  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  if (!user) {
    return null;
  }

  // Prevent rendering dropdown if user isn't available.
  // We don't want to show nameless user.
  if (!user) {
    return null;
  }
  return (
    <>
      <Dropdown open={menuOpen}>
        <DropdownMenuTrigger
          asChild
          onClick={() => setMenuOpen((menuOpen) => !menuOpen)}
        >
          <button
            className={classNames(
              "bg-default group mx-0 flex cursor-pointer appearance-none items-center rounded-full text-left outline-none hover:bg-slate-200 focus:outline-none focus:ring-0 md:rounded-none lg:rounded",
              small ? "p-2" : "ml-[-10px]] py-1.5"
            )}
          >
            {currentUser && (
              <SocialAvatar
                size="sm"
                appId={currentUser?.appId!}
                avatarUrl={currentUser?.avatarUrl!}
              />
            )}
            {/* </span> */}
            {!small && (
              <span className="flex flex-grow items-center gap-2">
                <span className="line-clamp-1 flex-grow text-sm leading-none">
                  <span className="text-emphasis ml-1 hidden font-medium lg:block">
                    {currentUser?.name || "Api User"}
                  </span>
                </span>
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          {/* <FreshChatProvider> */}
          <DropdownMenuContent
            align="start"
            onInteractOutside={() => {
              setMenuOpen(false);
              setHelpOpen(false);
            }}
            className="group overflow-hidden rounded-md"
          >
            <>
              <DropdownMenuItem>
                <DropdownItem
                  type="button"
                  StartIcon={(props) => (
                    <UserIcon
                      className={classNames("text-default", props.className)}
                      aria-hidden="true"
                    />
                  )}
                  href="/settings/my-account/profile"
                >
                  {t("my_profile")}
                </DropdownItem>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DropdownItem
                  type="button"
                  StartIcon={(props) => (
                    <Users
                      className={classNames("text-default", props.className)}
                      aria-hidden="true"
                    />
                  )}
                  onClick={handleShowModalMenu}
                >
                  {t("My Accounts")}
                </DropdownItem>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DropdownItem
                  type="button"
                  StartIcon={(props) => (
                    <LogOut aria-hidden="true" {...props} />
                  )}
                  onClick={() => signOut({ callbackUrl: "/auth/logout" })}
                >
                  {t("sign_out")}
                </DropdownItem>
              </DropdownMenuItem>
            </>
          </DropdownMenuContent>
          {/* </FreshChatProvider> */}
        </DropdownMenuPortal>
      </Dropdown>
      <>
        {" "}
        <ModalAccount
          showModal={showModalAccounts}
          onClose={handleCloseModalMenu}
        />
      </>
    </>
  );
}

export type NavigationItemType = {
  name: string;
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  target?: HTMLAnchorElement["target"];
  badge?: React.ReactNode;
  icon?: SVGComponent;
  child?: NavigationItemType[];
  pro?: true;
  onlyMobile?: boolean;
  onlyDesktop?: boolean;
  isCurrent?: ({
    item,
    isChild,
    router,
  }: {
    item: Pick<NavigationItemType, "href">;
    isChild?: boolean;
    router: NextRouter;
  }) => boolean;

  isLabelOnly?: boolean;
  isAdminOnly?: boolean;
  isNeedAI?: boolean;
};

const requiredCredentialNavigationItems = ["Routing Forms"];
const MORE_SEPARATOR_NAME = "Admin";
//const { data: user } = useMeQuery();

const navigation: NavigationItemType[] = [
  {
    name: "Write",
    href: "/write/0",
    icon: PenTool,
    isCurrent: ({ router }) => {
      const path = router.asPath.split("?")[0];
      return path.startsWith("/write");
    },
  },
  {
    name: "AI-Write",
    href: "/ai-write",
    icon: Lightbulb,
    isNeedAI: true,
  },

  {
    name: "Templates",
    href: "/post-generator",
    icon: Wand,
    isNeedAI: true,
  },
  {
    name: "My Content",
    href: "/my-content/all",
    icon: FileClock,
    isCurrent: ({ router }) => {
      const path = router.asPath.split("?")[0];
      return path.startsWith("/my-content");
    },
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Headline Generator",
    href: "/tools/linkedin/headline-generator",
    icon: Newspaper,
    isCurrent: ({ router, item }) => {
      // During Server rendering path is /v2/apps but on client it becomes /apps(weird..)
      const path = router.asPath.split("?")[0];
      return path?.startsWith(item.href) ?? false;
    },
  },
  {
    name: "About Generator",
    href: "/tools/linkedin/about-generator",
    icon: BookOpen,
    isCurrent: ({ router, item }) => {
      const path = router.asPath.split("?")[0];
      return path?.startsWith(item.href) ?? false;
    },
  },
  {
    name: "Apps",
    href: "/settings/my-account/app-integrations",
    icon: Atom,
    isCurrent: ({ router }) => {
      const path = router.asPath.split("?")[0];
      return path.startsWith("/settings");
    },
  },

  {
    name: "Billing",
    href: "/billing/overview",
    icon: CreditCard,
    isCurrent: ({ router }) => {
      const path = router.asPath.split("?")[0];
      return path.startsWith("/billing");
    },
  },
];

// Extract navigation paths for redirect exclusions
const getNavigationPaths = () => {
  const paths = new Set<string>();

  navigation.forEach(item => {
    // Extract the base path from href (remove specific IDs/params)
    const basePath = item.href.split('/').slice(0, 2).join('/');
    if (basePath && basePath !== '/') {
      paths.add(basePath);
    }
  });

  // Add essential paths that should never trigger redirects
  paths.add('/auth');
  paths.add('/getting-started');

  return Array.from(paths);
};

const NAVIGATION_PATHS = getNavigationPaths();
{
  /* Herocon have CreditCardIcon and BuildingOfficeIcon */
}
// We create all needed navigation items for the different use cases
let {
  desktopNavigationItems,
  mobileNavigationBottomItems,
  mobileNavigationMoreItems,
} = navigation.reduce<Record<string, NavigationItemType[]>>(
  (items, item) => {
    // We filter out the "more" separator in` desktop navigation
    if (item.href !== "/more") items.desktopNavigationItems.push(item);
    // Items for mobile bottom navigation
    if (!item.onlyDesktop) {
      items.mobileNavigationBottomItems.push(item);
    } // Items for the "more" menu in mobile navigation
    else {
      if (!item.isLabelOnly) {
        items.mobileNavigationMoreItems.push(item);
      }
    }
    return items;
  },
  {
    desktopNavigationItems: [],
    mobileNavigationBottomItems: [],
    mobileNavigationMoreItems: [],
  }
);

const Navigation = ({ user, currentUser }: { user: any; currentUser: any }) => {
  // const { data: user } = useMeQuery();

  if (user && !user.isAdmin) {
    desktopNavigationItems = desktopNavigationItems.filter(
      (x) => !x.isAdminOnly && x.name !== "Admin"
    );
  }
  return user ? (
    <>
      <p className="pl-[10px] pt-0 text-center text-[12px] font-medium lg:text-left lg:text-[16px] ">
        Hi{" "}
        {currentUser?.name ||
          user.currentSocialProfile?.name ||
          user.name ||
          "Nameless User"}
      </p>
      <nav className=" ml-0 mt-4 flex-1 md:ml-2 md:px-2 lg:px-0">
        {desktopNavigationItems.map((item) =>
          item?.isLabelOnly ? (
            <div
              className="mb-2 ml-[-12px] mt-4 pl-[10px] pt-0 text-[12px] text-[#808C96] lg:ml-[-8px] "
              key={item.name}
            >
              {item.name}
            </div>
          ) : (
            <NavigationItem key={item.name} item={item} />
          )
        )}
      </nav>
    </>
  ) : (
    <></>
  );
};

function useShouldDisplayNavigationItem(item: NavigationItemType) {
  const { status } = useSession();
  // const { data: routingForms } = trpc.viewer.appById.useQuery(
  //   { appId: "routing-forms" },
  //   {
  //     enabled: status === "authenticated" && requiredCredentialNavigationItems.includes(item.name),
  //     trpc: {},
  //   }
  // );
  // const flags = useFlagMap();
  // if (isKeyInObject(item.name, flags)) return flags[item.name];
  // return !requiredCredentialNavigationItems.includes(item.name) || routingForms?.isInstalled;
  return !requiredCredentialNavigationItems.includes(item.name);
}

const defaultIsCurrent: NavigationItemType["isCurrent"] = ({
  isChild,
  item,
  router,
}) => {
  return isChild
    ? item.href === router.asPath
    : item.href
    ? router.asPath.startsWith(item.href)
    : false;
};

const NavigationItem: React.FC<{
  index?: number;
  item: NavigationItemType;
  isChild?: boolean;
}> = (props) => {
  const { item, isChild } = props;
  const { t, isLocaleReady } = useLocale();
  const router = useRouter();
  const isCurrent: NavigationItemType["isCurrent"] =
    item.isCurrent || defaultIsCurrent;
  const current = isCurrent({ isChild: !!isChild, item, router });
  const shouldDisplayNavigationItem = useShouldDisplayNavigationItem(
    props.item
  );

  if (!shouldDisplayNavigationItem) return null;
  return (
    <Fragment>
      <Tooltip side="right" content={t(item.name)} className="lg:hidden">
        <Link
          href={item.href}
          aria-label={t(item.name)}
          className={classNames(
            "text-default group flex items-center rounded-md px-2 py-1.5 text-sm font-medium [&[aria-current='page']]:bg-slate-100",
            isChild
              ? `[&[aria-current='page']]:text-emphasis hidden h-8 pl-16 lg:flex lg:pl-11 [&[aria-current='page']]:bg-transparent ${
                  props.index === 0 ? "mt-0" : "mt-px"
                }`
              : "[&[aria-current='page']]:text-awst mt-0.5 text-sm",
            isLocaleReady ? "hover:text-awst hover:bg-slate-100" : ""
          )}
          aria-current={current ? "page" : undefined}
        >
          {item.icon && (
            <item.icon
              className="mr-2 h-4 w-4 flex-shrink-0 ltr:mr-2 rtl:ml-2 [&[aria-current='page']]:text-inherit"
              aria-hidden="true"
              aria-current={current ? "page" : undefined}
            />
          )}
          {isLocaleReady ? (
            <span className="hidden w-full justify-between lg:flex">
              <div className="flex">{t(item.name)}</div>
              {item.badge && item.badge}
            </span>
          ) : (
            <SkeletonText
              style={{ width: `${item.name.length * 10}px` }}
              className="h-[20px]"
            />
          )}
        </Link>
      </Tooltip>
      {item.child &&
        isCurrent({ router, isChild, item }) &&
        item.child.map((item, index) => (
          <NavigationItem index={index} key={item.name} item={item} isChild />
        ))}
    </Fragment>
  );
};

function MobileNavigationContainer() {
  const sessionData = useSession();
  const { status, data: sessionUserData } = sessionData;

  if (status !== "authenticated") return null;
  return <MobileNavigation />;
}

const MobileNavigation = () => {
  const isEmbed = false;
  const { data: user } = useMeQuery();
  if (user && !user.isAdmin) {
    mobileNavigationBottomItems = mobileNavigationBottomItems.filter(
      (x) => !x.isAdminOnly
    );
  }
  return (
    <>
      <nav
        className={classNames(
          "pwa:pb-2.5  bg-muted border-subtle fixed bottom-0 z-30 flex w-full border-t bg-opacity-40 px-1 shadow backdrop-blur-md md:hidden",
          isEmbed && "hidden"
        )}
      >
        {mobileNavigationBottomItems.map((item) => (
          <MobileNavigationItem key={item.name} item={item} />
        ))}
      </nav>
      {/* add padding to content for mobile navigation*/}
      <div className="block pt-12 md:hidden" />
    </>
  );
};

const MobileNavigationItem: React.FC<{
  item: NavigationItemType;
  isChild?: boolean;
}> = (props) => {
  const { item, isChild } = props;
  const router = useRouter();
  const { t, isLocaleReady } = useLocale();
  const isCurrent: NavigationItemType["isCurrent"] =
    item.isCurrent || defaultIsCurrent;
  const current = isCurrent({ isChild: !!isChild, item, router });
  const shouldDisplayNavigationItem = useShouldDisplayNavigationItem(
    props.item
  );

  if (!shouldDisplayNavigationItem) return null;
  return (
    <Link
      key={item.name}
      href={item.href}
      className="[&[aria-current='page']]:text-emphasis hover:text-default text-muted relative my-2 min-w-0 flex-1 overflow-hidden rounded-md !bg-transparent p-1 text-center text-xs font-medium focus:z-10 sm:text-sm"
      aria-current={current ? "page" : undefined}
    >
      {item.badge && <div className="absolute right-1 top-1">{item.badge}</div>}
      {item.icon && (
        <item.icon
          className="[&[aria-current='page']]:text-emphasis  mx-auto mb-1 block h-5 w-5 flex-shrink-0 text-center text-inherit"
          aria-hidden="true"
          aria-current={current ? "page" : undefined}
        />
      )}
      {isLocaleReady ? (
        <span className="block truncate">{t(item.name)}</span>
      ) : (
        <SkeletonText />
      )}
    </Link>
  );
};

const MobileNavigationMoreItem: React.FC<{
  item: NavigationItemType;
  isChild?: boolean;
}> = (props) => {
  const { item } = props;
  const { t, isLocaleReady } = useLocale();
  const shouldDisplayNavigationItem = useShouldDisplayNavigationItem(
    props.item
  );

  if (!shouldDisplayNavigationItem) return null;

  return (
    <li className="border-subtle border-b last:border-b-0" key={item.name}>
      <Link
        href={item.href}
        className="hover:bg-subtle flex items-center justify-between p-5"
      >
        <span className="text-default flex items-center font-semibold ">
          {item.icon && (
            <item.icon
              className="h-5 w-5 flex-shrink-0 ltr:mr-3 rtl:ml-3"
              aria-hidden="true"
            />
          )}
          {isLocaleReady ? t(item.name) : <SkeletonText />}
        </span>
        <ArrowRight className="text-subtle h-5 w-5" />
      </Link>
    </li>
  );
};

type SideBarContainerProps = {
  bannersHeight: number;
  user?: UserAuth | null;
  currentUser?: any;
};

type SideBarProps = {
  bannersHeight: number;
  user?: UserAuth | null;
  currentUser?: any;
};

function SideBarContainer({
  bannersHeight,
  user,
  currentUser,
}: SideBarContainerProps) {
  const { status } = useSession();

  // Check both session status and user data - if user data exists, treat as authenticated
  const isAuthenticated = status === "authenticated" || (user && user.id);

  if (status === "loading") {
    return null; // Still loading
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SideBar
      bannersHeight={bannersHeight}
      user={user}
      currentUser={currentUser}
    />
  );
}

function SideBar({ bannersHeight, user, currentUser }: SideBarProps) {
  const { t } = useLocale();
  const publicPageUrl = "";

  return (
    <div className="w-[200px] flex-shrink-0 hidden lg:block">
      <aside
        style={{
          maxHeight: `calc(100vh - ${bannersHeight || 0}px)`,
          width: "200px !important",
        }}
        className="desktop-transparent bg-default h-full max-h-screen flex-col overflow-y-auto overflow-x-hidden border-r flex sticky top-0"
      >
        <div className="-pl-1 -ml-2 gap-2.5 pt-5">
          <img
            src="/img/logo.png"
            style={{ maxWidth: "50%" }}
            className="max-w-1/2 mx-auto"
          ></img>
        </div>
        <div className="flex h-full flex-col justify-between py-3 lg:px-3 lg:pt-4">
          <div className="flex space-x-0.5 rtl:space-x-reverse"></div>

          <Navigation user={user} currentUser={currentUser}></Navigation>
        </div>

        <ul className="w-full pb-3 lg:px-3">
          <header className="items-center justify-between pl-4 pt-4 lg:flex lg:pl-0 ">
            <div data-testid="user-dropdown-trigger">
              <span className="hidden md:inline">
                <UserDropdown currentUser={currentUser} />
              </span>
              <span className="block md:hidden">
                <UserDropdown small currentUser={currentUser} />
              </span>
            </div>
          </header>
        </ul>
      </aside>
    </div>
  );
}

export function ShellMain(props: LayoutProps) {
  const router = useRouter();
  const { isLocaleReady } = useLocale();

  return (
    <>
      <div
        className={classNames(
          "bg-default flex items-center border-b px-4 pb-4 pt-4 sm:px-6 md:mb-8 md:mt-0 md:px-8 md:pb-6 md:pt-6 lg:px-6",
          props.smallHeading ? "lg:mb-10" : "lg:mb-12",
          props.hideHeadingOnMobile ? "mb-0" : "mb-8"
        )}
      >
        {!!props.backPath && (
          <Button
            variant="icon"
            size="sm"
            color="minimal"
            onClick={() =>
              typeof props.backPath === "string"
                ? router.push(props.backPath as string)
                : router.back()
            }
            StartIcon={ArrowLeft}
            aria-label="Go Back"
            className="rounded-md ltr:mr-2 rtl:ml-2"
          />
        )}
        {props.heading && (
          <header
            className={classNames(
              props.large && "py-8",
              "flex w-full max-w-full  items-center !overflow-visible truncate"
            )}
          >
            {props.HeadingLeftIcon && (
              <div className="ltr:mr-4">{props.HeadingLeftIcon}</div>
            )}
            <div
              className={classNames(
                "w-full truncate md:block ltr:mr-4 rtl:ml-4",
                props.headerClassName
              )}
            >
              {props.heading && (
                <h3
                  className={classNames(
                    "font-quill text-emphasis max-w-28 truncate text-lg font-semibold tracking-wide sm:max-w-72 sm:text-xl md:max-w-80 xl:max-w-full mb-2",
                    props.smallHeading ? "text-base" : "text-xl",
                    props.hideHeadingOnMobile ? "hidden md:block" : "block"
                  )}
                >
                  {!isLocaleReady ? <SkeletonText invisible /> : props.heading}
                </h3>
              )}
              {props.subtitle && (
                <p className="text-default text-sm leading-relaxed mt-1">
                  {!isLocaleReady ? <SkeletonText invisible /> : props.subtitle}
                </p>
              )}
            </div>
            {props.beforeCTAactions}
            {props.CTA && (
              <div
                className={classNames(
                  props.backPath
                    ? "relative"
                    : "pwa:bottom-24 fixed bottom-20 z-40 md:z-auto ltr:right-4 md:ltr:right-0 rtl:left-4 md:rtl:left-0",
                  "flex-shrink-0 md:relative md:bottom-auto md:right-auto"
                )}
              >
                {props.CTA}
              </div>
            )}
            {props.actions && props.actions}
          </header>
        )}
      </div>
      {props.afterHeading && <>{props.afterHeading}</>}
      <div
        className={classNames(
          props.flexChildrenContainer
            ? "flex flex-1 flex-col"
            : "mt-0 px-4 pb-6 sm:px-6 md:px-8 lg:px-6 lg:mt-[-10px]"
        )}
      >
        {props.children}
      </div>
    </>
  );
}

function MainContainer({
  MobileNavigationContainer: MobileNavigationContainerProp = (
    <MobileNavigationContainer />
  ),
  TopNavContainer: TopNavContainerProp = <TopNavContainer />,
  ...props
}: LayoutProps) {
  return (
    <main className="relative z-0 flex-1 bg-slate-50 focus:outline-none">
      {/* show top navigation for md and smaller (tablet and phones) */}
      {TopNavContainerProp}
      <div className="max-w-ful bg-slate-50">
        <ErrorBoundary>
          {!props.withoutMain ? (
            <ShellMain {...props}>{props.children}</ShellMain>
          ) : (
            props.children
          )}
        </ErrorBoundary>
        {/* show bottom navigation for md and smaller (tablet and phones) on pages where back button doesn't exist */}
        {!props.backPath ? MobileNavigationContainerProp : null}
      </div>
    </main>
  );
}

function TopNavContainer() {
  const sessionData = useSession();
  const { status, data: sessionUserData } = sessionData;

  if (status !== "authenticated") return null;
  return <TopNav />;
}

function TopNav() {
  const isEmbed = false;
  const { t } = useLocale();
  return (
    <>
      <nav
        style={isEmbed ? { display: "none" } : {}}
        className="bg-muted border-subtle sticky top-0 z-40 flex w-full items-center justify-between border-b bg-opacity-50 px-4 py-1.5 backdrop-blur-lg sm:p-4 md:hidden"
      >
        <Link href="/write/0">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 self-center">
          <span className="hover:bg-muted hover:text-emphasis text-default group flex items-center rounded-full text-sm font-medium lg:hidden">
            <KBarTrigger />
          </span>
          <button className="hover:bg-muted hover:text-subtle text-muted rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            <span className="sr-only">{t("settings")}</span>
            <Link href="/settings/my-account/profile">
              <Settings className="text-default h-4 w-4" aria-hidden="true" />
            </Link>
          </button>
          <UserDropdown small />
        </div>
      </nav>
    </>
  );
}

export const MobileNavigationMoreItems = () => (
  <ul className="border-subtle mt-2 rounded-md border">
    {mobileNavigationMoreItems.map((item) => (
      <MobileNavigationMoreItem key={item.name} item={item} />
    ))}
  </ul>
);
