import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import useMediaQuery from "@quillsocial/lib/hooks/useMediaQuery";
import { trpc } from "@quillsocial/trpc/react";
import type {
  HorizontalTabItemProps,
  VerticalTabItemProps,
} from "@quillsocial/ui";
import { HeadSeo, HorizontalTabs } from "@quillsocial/ui";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";

import { withQuery } from "@lib/QueryCell";

import PageWrapper from "@components/PageWrapper";
import BillingHistory from "@components/billing/history";
import BillingOverview from "@components/billing/overview";
import PaymentMethods from "@components/billing/payment_methods";
import ManageBilling from "@components/billing/manage";

const validTabs = ["overview", "history", "payment_methods", "manage"] as const;

const querySchema = z.object({
  tab: z.enum(validTabs),
});
const BillingPage = () => {
  const { t } = useLocale();
  const router = useRouter();
  const { query } = router;
  // const { data: user } = useMeQuery();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const tabs: (VerticalTabItemProps | HorizontalTabItemProps)[] = [
    {
      name: "Overview",
      href: "/billing/overview",
    },
    // {
    //   name: "Billing History",
    //   href: "/billing/history",
    // },
    // {
    //   name: "Payment Methods",
    //   href: "/billing/payment_methods",
    // },
    {
      name: "Billing",
      href: "/billing/manage",
    },
  ];
  const { tab } = router.isReady
    ? querySchema.parse(router.query)
    : { tab: "overview" as const };
  return (
    <div>
      <HeadSeo
        title="Billing"
        description="Manage your subscription and payment methods."
      />
      <Shell
        withoutSeo
        heading="Billing"
        hideHeadingOnMobile
        subtitle="Manage your subscription and payment methods."
      >
        <div>
          <div className="ml-[20px] flex flex-wrap md:ml-0">
            <HorizontalTabs tabs={tabs} />
            <div className="overflow-x-auto lg:ml-auto">
              {/* <FiltersContainer /> */}
            </div>
          </div>
          {tab === "overview" && <BillingOverview></BillingOverview>}
          {tab === "history" && <BillingHistory></BillingHistory>}
          {tab === "payment_methods" && <PaymentMethods></PaymentMethods>}
          {tab === "manage" && <ManageBilling></ManageBilling>}
        </div>
      </Shell>
    </div>
  );
};
BillingPage.PageWrapper = PageWrapper;
export default BillingPage;
