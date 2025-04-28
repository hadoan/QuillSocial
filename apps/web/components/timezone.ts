import dayjs from "@quillsocial/dayjs";

export const getBrowerTimeZone = () => {
  let tz = dayjs.tz.guess();
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!tz) {
    // Get the browser's timezone
    tz = browserTz;
    if (!tz) {
      tz = "Asia/Singapore";
    }
  }
  return tz;
};
