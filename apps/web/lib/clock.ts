// handles logic related to user clock display using 24h display / timeZone options.
import dayjs from "@quillsocial/dayjs";
import {
  getIs24hClockFromLocalStorage,
  isBrowserLocale24h,
  setIs24hClockInLocalStorage,
} from "@quillsocial/lib/timeFormat";
import { localStorage } from "@quillsocial/lib/webstorage";

import { getBrowerTimeZone } from "@components/timezone";

interface TimeOptions {
  is24hClock: boolean;
  inviteeTimeZone: string;
}

const timeOptions: TimeOptions = {
  is24hClock: false,
  inviteeTimeZone: "",
};

const isInitialized = false;

const initClock = () => {
  if (isInitialized) {
    return;
  }
  // This only sets browser locale if there's no preference on localStorage.
  if (getIs24hClockFromLocalStorage() === null)
    set24hClock(isBrowserLocale24h());
  timeOptions.is24hClock = !!getIs24hClockFromLocalStorage();
  const tz = getBrowerTimeZone();
  timeOptions.inviteeTimeZone =
    localStorage.getItem("timeOption.preferredTimeZone") || tz;
};

const is24h = (is24hClock?: boolean) => {
  initClock();
  if (typeof is24hClock !== "undefined") set24hClock(is24hClock);
  return timeOptions.is24hClock;
};

const set24hClock = (is24hClock: boolean) => {
  setIs24hClockInLocalStorage(is24hClock);
  timeOptions.is24hClock = is24hClock;
};

function setTimeZone(selectedTimeZone: string) {
  localStorage.setItem("timeOption.preferredTimeZone", selectedTimeZone);
  timeOptions.inviteeTimeZone = selectedTimeZone;
}

const timeZone = (selectedTimeZone?: string) => {
  initClock();
  if (selectedTimeZone) setTimeZone(selectedTimeZone);
  return timeOptions.inviteeTimeZone;
};

export { is24h, timeZone };
