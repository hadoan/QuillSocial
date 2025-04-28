import { getLocaleFromHeaders } from "@quillsocial/lib/i18n";
import { createContext } from "@quillsocial/trpc/server/createContext";
import { appRouter } from "@quillsocial/trpc/server/routers/_app";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import superjson from "superjson";

// import { createProxySSGHelpers } from "@trpc/react-query";
// import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createServerSideHelpers } from "@trpc/react-query/server";

/**
 * Initialize server-side rendering tRPC helpers.
 * Provides a method to prefetch tRPC-queries in a `getServerSideProps`-function.
 * Automatically prefetches i18n based on the passed in `context`-object to prevent i18n-flickering.
 * Make sure to `return { props: { trpcState: ssr.dehydrate() } }` at the end.
 */
export async function ssrInit(context: GetServerSidePropsContext) {
  const ctx = await createContext(context);
  const locale = getLocaleFromHeaders(context.req);
  const i18n = await serverSideTranslations(getLocaleFromHeaders(context.req), ["common", "vital"]);

  const ssr = createServerSideHelpers({
    router: appRouter,
    transformer: superjson,
    ctx: { ...ctx, locale, i18n },
  });

  // always preload "viewer.public.i18n"
  // await ssr.viewer.public.i18n.fetch();
  // So feature flags are available on first render
  // await ssr.viewer.features.map.prefetch();
  // Provides a better UX to the users who have already upgraded.
  // await ssr.viewer.teams.hasTeamPlan.prefetch();

  return ssr;
}
