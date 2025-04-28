import router from "next/router";
import { useEffect } from "react";

import ReminderDaysBilling from "@quillsocial/features/payments/ConstRemindDays";
import { trpc } from "@quillsocial/trpc";

import useMeQuery from "./useMeQuery";

export const redirectIfTrialOver = (mobileNavigationBottomItems: any[], desktopNavigationItems: any[]) => {
  const { isLoading, data: user } = useMeQuery();
  const { isLoading: isCheckPricingLoading, data } = trpc.viewer.teams.checkPricingTeam.useQuery();
  if (!isCheckPricingLoading && !isLoading && user) {
    if (data) {
      if (data?.day === ReminderDaysBilling.END_REMINDER && data?.isRemind) {
        mobileNavigationBottomItems = mobileNavigationBottomItems.filter(
          (x) => x.name.toLowerCase() === "billing" || x.name.toLowerCase() === "employees"
        );
        desktopNavigationItems = desktopNavigationItems.filter(
          (x) => x.name.toLowerCase() === "billing" || x.name.toLowerCase() === "employees"
        );
        const currentUrl = router.asPath;
        if (!(currentUrl.includes("billing") || currentUrl.includes("employee"))) {
          router.push("/billing/overview");
        }
      }
    }
  }
  return {
    mobileNavigationBottomItems,
    desktopNavigationItems,
    user,
    pricingData: data
  };
};
