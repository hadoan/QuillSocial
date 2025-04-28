// import LicenseRequired from "@quillsocial/features/ee/common/components/LicenseRequired";
import { DefaultSeo } from "next-seo";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Head from "next/head";
import Script from "next/script";

import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { buildCanonical } from "@quillsocial/lib/next-seo.config";

import type { AppProps } from "@lib/app-providers";
import AppProviders from "@lib/app-providers";
import { seoConfig } from "@lib/config/next-seo.config";

import I18nLanguageHandler from "@components/I18nLanguageHandler";

export interface CalPageWrapper {
  (props?: AppProps): JSX.Element;
  PageWrapper?: AppProps["Component"]["PageWrapper"];
}

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  preload: true,
  display: "swap",
});

function PageWrapper(props: AppProps) {
  const { Component, pageProps, err, router } = props;
  let pageStatus = "200";

  if (router.pathname === "/404") {
    pageStatus = "404";
  } else if (router.pathname === "/500") {
    pageStatus = "500";
  }

  // On client side don't let nonce creep into DOM
  // It also avoids hydration warning that says that Client has the nonce value but server has "" because browser removes nonce attributes before DOM is built
  // See https://github.com/kentcdodds/nonce-hydration-issues
  // Set "" only if server had it set otherwise keep it undefined because server has to match with client to avoid hydration error
  const nonce =
    typeof window !== "undefined"
      ? pageProps.nonce
        ? ""
        : undefined
      : pageProps.nonce;
  const providerProps = {
    ...props,
    pageProps: {
      ...props.pageProps,
      nonce,
    },
  };
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  const path = router.asPath;

  return (
    <AppProviders {...providerProps}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <DefaultSeo
        // Set canonical to https://quillsocial.co or self-hosted URL
        canonical={
          buildCanonical({ path, origin: "https://quillsocial.co" }) // quillsocial.co & .dev
        }
        {...seoConfig.defaultNextSeo}
      />
      {/* <script
        type="text/javascript"
        id="hs-script-loader"
        async
        defer
        src="//js-na1.hs-scripts.com/22534248.js"></script> */}

      <I18nLanguageHandler />
      <Script
        nonce={nonce}
        id="page-status"
        dangerouslySetInnerHTML={{
          __html: `window.CalComPageStatus = '${pageStatus}'`,
        }}
      />

      <style jsx global>{`
        :root {
          --font-inter: ${interFont.style.fontFamily};
        }
      `}</style>

      {getLayout(
        Component.requiresLicense ? (
          // <LicenseRequired>
          <Component {...pageProps} err={err} />
        ) : (
          // </LicenseRequired>
          <Component {...pageProps} err={err} />
        ),
        router
      )}
    </AppProviders>
  );
}

export default PageWrapper;
