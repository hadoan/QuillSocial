"use client";

import { withQuery } from "./QueryCell";
import { trpc } from "@quillsocial/trpc/react";
import useMeQuery from "@quillsocial/trpc/react/hooks/useMeQuery";
import { Notifications } from "@quillsocial/ui";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export const BillingNotifications = ({ pricingData }: any) => {
  const [notificationBillingDays, setNotificationBillingDays] = useState<
    string | null
  >(null);
  const [notificationBillingDaysExpired, setNotificationBillingDaysExpired] =
    useState<string | null>(null);
  const [notificationDismissedToday, setNotificationDismissedToday] =
    useState<boolean>(false);

  const router = useRouter();

  // Helper function to get today's date as a string
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };

  // Helper function to check if notification was dismissed today
  const wasNotificationDismissedToday = () => {
    const dismissedDate = localStorage.getItem("notificationDismissedDate");
    return dismissedDate === getTodayString();
  };

  useEffect(() => {
    setNotificationBillingDays(
      sessionStorage.getItem("notificationBillingDays")
    );
    setNotificationBillingDaysExpired(
      sessionStorage.getItem("notificationBillingDaysExpired")
    );
    // Check dismiss status on component mount
    setNotificationDismissedToday(wasNotificationDismissedToday());
  }, []);

  // Handle dismiss action
  const handleDismiss = () => {
    // Save today's date when user dismisses the notification
    localStorage.setItem("notificationDismissedDate", getTodayString());
    // Immediately update the state to hide notification
    setNotificationDismissedToday(true);
  };

  // Calculate if notification should show
  const shouldShowNotification =
    pricingData?.isRemind &&
    !notificationDismissedToday &&
    ((pricingData?.day < 14 && !notificationBillingDays) ||
      (pricingData?.day >= 14 && !notificationBillingDaysExpired));

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
        onDismiss={handleDismiss}
        show={shouldShowNotification}
        dismisText="Dismiss"
      ></Notifications>
    </>
  );
};
