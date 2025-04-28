import type { GetStaticPropsContext } from "next";
import dynamic from "next/dynamic";

export const AppSetupPageMap = {
  "xconsumerkeys-social": dynamic(() => import("../../xconsumerkeyssocial/pages/setup")),
  "chatgpt-ai": dynamic(() => import("../../chatgptai/pages/setup")),
};

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const { slug } = ctx.params || {};
  if (typeof slug !== "string") return { notFound: true } as const;
  if (!(slug in AppSetupPageMap)) return { props: {} };

  const page: any = await AppSetupPageMap[slug as keyof typeof AppSetupPageMap];

  if (!page.getStaticProps) return { props: {} };

  const props = await page.getStaticProps(ctx);

  return props;
};
