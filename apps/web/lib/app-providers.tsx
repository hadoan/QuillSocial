import { useViewerI18n } from "@components/I18nLanguageHandler";
import usePublicPage from "@lib/hooks/usePublicPage";
import type { WithNonceProps } from "@lib/withNonce";
import { MetaProvider } from "@quillsocial/ui";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SessionProvider } from "next-auth/react";
import type { SSRConfig } from "next-i18next";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";
import type {
  AppProps as NextAppProps,
  AppProps as NextJsAppProps,
} from "next/app";
import type { NextRouter } from "next/router";
import { useRouter } from "next/router";
import type { ComponentProps, PropsWithChildren, ReactNode } from "react";

const I18nextAdapter = appWithTranslation<
  NextJsAppProps<SSRConfig> & { children: React.ReactNode }
>(({ children }) => <>{children}</>);

// Workaround for https://github.com/vercel/next.js/issues/8592
export type AppProps = Omit<
  NextAppProps<
    WithNonceProps & { themeBasis?: string } & Record<string, unknown>
  >,
  "Component"
> & {
  Component: NextAppProps["Component"] & {
    requiresLicense?: boolean;
    isThemeSupported?: boolean;
    isBookingPage?: boolean | ((arg: { router: NextRouter }) => boolean);
    getLayout?: (page: React.ReactElement, router: NextRouter) => ReactNode;
    PageWrapper?: (props: AppProps) => JSX.Element;
  };

  /** Will be defined only is there was an error */
  err?: Error;
};

type AppPropsWithChildren = AppProps & {
  children: ReactNode;
};

const CustomI18nextProvider = (props: AppPropsWithChildren) => {
  const viewerI18n = useViewerI18n();
  const locale = viewerI18n.data?.locale ?? props.router?.locale ?? "en";
  const i18n = viewerI18n.data?.i18n;

  const pageProps = i18n
    ? {
        ...props.pageProps,
        ...i18n,
      }
    : props.pageProps;

  const routerWithLocale =
    props.router && locale
      ? ({
          ...props.router,
          locale,
        } as typeof props.router)
      : props.router;

  const passedProps = {
    ...props,
    pageProps,
    router: routerWithLocale,
  } as unknown as ComponentProps<typeof I18nextAdapter>;

  return <I18nextAdapter {...passedProps} />;
};

const enum ThemeSupport {
  // e.g. Login Page
  None = "none",
  // Entire App except Booking Pages
  App = "systemOnly",
  // Booking Pages(including Routing Forms)
  Booking = "userConfigured",
}

type MyAppThemeProps = PropsWithChildren<
  Pick<AppProps["pageProps"], "nonce" | "themeBasis"> &
    Pick<AppProps["Component"], "isBookingPage" | "isThemeSupported">
>;
const MyAppThemeProvider = (props: MyAppThemeProps) => {
  const router = useRouter();

  const { key, ...themeProviderProps } = getThemeProviderProps({
    props,
    router,
  });

  return (
    <ThemeProvider key={key} {...themeProviderProps}>
  {/* color-scheme makes background:transparent not work in iframe. */}
      {typeof window !== "undefined" && (
        <style jsx global>
          {`
            .dark {
              color-scheme: light;
            }
          `}
        </style>
      )}
      {props.children}
    </ThemeProvider>
  );
};

function getThemeProviderProps({ props, router }: { props: Omit<MyAppThemeProps, "children">; router: NextRouter; }) {
  const isBookingPage = (() => {
    if (typeof props.isBookingPage === "function") {
      return props.isBookingPage({ router: router });
    }
    return props.isBookingPage;
  })();

  const themeSupport = isBookingPage
    ? ThemeSupport.Booking
    : // if isThemeSupported is explicitly false, we don't use theme there
    props.isThemeSupported === false
    ? ThemeSupport.None
    : ThemeSupport.App;

  const isBookingPageThemSupportRequired =
    themeSupport === ThemeSupport.Booking;
  const themeBasis = props.themeBasis;

  if (isBookingPageThemSupportRequired && !themeBasis) {
    console.warn(
      "`themeBasis` is required for booking page theme support. Not providing it will cause theme flicker."
    );
  }

  const forcedTheme = themeSupport === ThemeSupport.None ? "light" : undefined;

  const storageKey = "app-theme";

  return {
    storageKey,
    forcedTheme,
    themeSupport,
    nonce: props.nonce,
    enableColorScheme: false,
    enableSystem: themeSupport !== ThemeSupport.None,
    // next-themes doesn't listen to changes on storageKey. So we need to force a re-render when storageKey changes
    // This is how login to dashboard soft navigation changes theme from light to dark
    key: storageKey,
    attribute: "class",
  };
}

const AppProviders = (props: AppPropsWithChildren) => {
  const isPublicPage = usePublicPage();

  const RemainingProviders = (
    <SessionProvider>
      <CustomI18nextProvider {...props}>
        <TooltipProvider>
          {/* color-scheme makes background:transparent not work which is required by embed. We need to ensure next-theme adds color-scheme to `body` instead of `html`(https://github.com/pacocoursey/next-themes/blob/main/src/index.tsx#L74). Once that's done we can enable color-scheme support */}
          <MyAppThemeProvider
            themeBasis={props.pageProps.themeBasis}
            nonce={props.pageProps.nonce}
            isThemeSupported={props.Component.isThemeSupported}
            isBookingPage={props.Component.isBookingPage}
          >
            <MetaProvider>{props.children}</MetaProvider>
          </MyAppThemeProvider>
        </TooltipProvider>
      </CustomI18nextProvider>
    </SessionProvider>
  );

  if (isPublicPage) {
    return RemainingProviders;
  }
  return RemainingProviders;
};

export default AppProviders;
