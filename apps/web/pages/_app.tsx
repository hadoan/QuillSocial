import "../styles/globals.css";
import GA from "@lib/analytics/ga";
import type { AppProps } from "@lib/app-providers";
import { trpc } from "@quillsocial/trpc/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  useEffect(() => {
    if (!GA.isEnabled()) return;
    const handleRouteChange = (url: string) => {
      GA.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    // initial page load
    GA.pageview(window.location.pathname + window.location.search);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (Component.PageWrapper !== undefined) return Component.PageWrapper(props);
  return <Component {...pageProps} />;
}

export default trpc.withTRPC(MyApp);
