import dayjs from "@quillsocial/dayjs";
import { BillingType } from "@quillsocial/prisma/enums";

export const getConditionToUpgrade = (
  data:
    | {
        countAccount: number;
        countPost: number;
      }
    | undefined,
  type: BillingType
): {
  accountIsTrue: boolean;
  postIsTrue: boolean;
  // month: number,
} => {
  const nAccount = data?.countAccount ?? 0;
  const nPost = data?.countPost ?? 0;
  if (!type || type === BillingType.FREE_TIER) {
    return {
      accountIsTrue: nAccount < 1,
      postIsTrue: nPost < 12,
      // month: 1,
    };
  } else if (type === BillingType.BUSINESS) {
    return {
      accountIsTrue: true,
      postIsTrue: true,
      // month: 12,
    };
  } else if (type === BillingType.UNLIMITED) {
    return {
      accountIsTrue: true,
      postIsTrue: true,
      // month: Infinity,
    };
  }

  throw new Error("Type is not valid!");
};

export const isWithinMonthLimit = (selectedDateTime: any, monthLimit: any) => {
  const today = dayjs();
  const selectedDate = dayjs(selectedDateTime);
  const diffInMonths = selectedDate.diff(today, "month");
  return diffInMonths < monthLimit;
};
