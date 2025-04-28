import dayjs from "@quillsocial/dayjs";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  showToast,
} from "@quillsocial/ui";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function TimezoneChangeDialog() {
  const { t } = useLocale();
  const { data: user, isLoading } = trpc.viewer.me.useQuery();
  const utils = trpc.useContext();
  const userTz = user?.timeZone;
  const currentTz = dayjs.tz.guess();
  const formattedCurrentTz = currentTz?.replace("_", " ");

  // update user settings
  const onSuccessMutation = async () => {
    showToast(t("updated_timezone_to", { formattedCurrentTz }), "success");
    await utils.viewer.me.invalidate();
  };

  const onErrorMutation = () => {
    showToast(t("couldnt_update_timezone"), "error");
  };

  // update timezone in db
  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: onSuccessMutation,
    onError: onErrorMutation,
  });

  function updateTimezone() {
    setOpen(false);
    mutation.mutate({
      timeZone: currentTz,
    });
  }

  // check for difference in user timezone and current browser timezone
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tzDifferent =
      !isLoading &&
      dayjs.tz(undefined, currentTz).utcOffset() !==
        dayjs.tz(undefined, userTz).utcOffset();
    const showDialog =
      tzDifferent && !document.cookie.includes("quillsocial-timezone-dialog=1");
    setOpen(showDialog);
  }, [currentTz, isLoading, userTz]);

  // save cookie to not show again
  function onCancel(maxAge: number, toast: boolean) {
    setOpen(false);
    document.cookie = `quillsocial-timezone-dialog=1;max-age=${maxAge}`;
    toast && showToast(t("we_wont_show_again"), "success");
  }

  const { data } = useSession();

  if (data?.user.impersonatedByUID) return null;

  const ONE_DAY = 60 * 60 * 24; // 1 day in seconds (60 seconds * 60 minutes * 24 hours)
  const THREE_MONTHS = ONE_DAY * 90; // 90 days in seconds (90 days * 1 day in seconds)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        title={t("update_timezone_question")}
        description={t("update_timezone_description", { formattedCurrentTz })}
        type="creation"
        onInteractOutside={() => onCancel(ONE_DAY, false) /* 1 day expire */}
      >
        {/* todo: save this in db and auto-update when timezone changes (be able to disable??? if yes, /settings)
        <Checkbox description="Always update timezone" />
        */}
        <div className="mb-8" />
        <DialogFooter showDivider>
          <DialogClose
            onClick={() => onCancel(THREE_MONTHS, true)}
            color="secondary"
          >
            {t("dont_update")}
          </DialogClose>
          <DialogClose onClick={() => updateTimezone()} color="primary">
            {t("update_timezone")}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
