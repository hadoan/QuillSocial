"use client";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { trpc } from "@quillsocial/trpc/react";
import useMeQuery from "@quillsocial/trpc/react/hooks/useMeQuery";
import { Notifications } from "@quillsocial/ui";

import { withQuery } from "./QueryCell";

export const BillingNotifications = ({ pricingData }: any) => {
  const [notificationBillingDays, setNotificationBillingDays] = useState<
    string | null
  >(null);
  const [notificationBillingDaysExpired, setNotificationBillingDaysExpired] =
    useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setNotificationBillingDays(
      sessionStorage.getItem("notificationBillingDays")
    );
    setNotificationBillingDaysExpired(
      sessionStorage.getItem("notificationBillingDaysExpired")
    );
  }, []);
  return (
    <>
      <Notifications
        day={pricingData?.day}
        title={
          pricingData?.day < 14
            ? `${Math.round(pricingData?.dayTrial) + 1}/14 Days Free Trial`
            : `Your Free Trial Has Ended 🙁`
        }
        desc={
          pricingData?.day < 14
            ? "🌟 Your free trial is coming to a close - Subscribe now for continued awesomeness! 🚀"
            : "⏰ Don't Miss Out on Uninterrupted Productivity - Start Your Subscription Now!"
        }
        ctaClicked={() => {
          if (pricingData?.day >= 14) {
            sessionStorage.setItem("notificationBillingDaysExpired", "true");
          } else {
            sessionStorage.setItem("notificationBillingDays", "true");
          }
          router.push("/billing/overview");
        }}
        ctaText="Subscribe"
        show={
          pricingData?.isRemind &&
          ((pricingData?.day < 14 && !notificationBillingDays) ||
            (pricingData?.day >= 14 && !notificationBillingDaysExpired))
        }
        dismisText="Dismiss"
      ></Notifications>
    </>
  );
};
