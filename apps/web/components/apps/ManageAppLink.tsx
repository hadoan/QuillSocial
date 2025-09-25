import type { App as AppType } from "@quillsocial/types/App";
import { Button } from "@quillsocial/ui";
import { useRouter } from "next/router";

export default function ManageAppLink({ type }: { type: AppType["type"] }) {
  const router = useRouter();
  // const link = type == "google_calendar" ? "/apps/installed/calendar" : "/apps/installed/conferencing";
  const link = "/apps/installed/social";
  return (
    <Button
      className="px-2 py-1 text-sm text-white lg:px-4 lg:py-2"
      onClick={() => router.push(link)}
    >
      Manage App
    </Button>
  );
  return <></>;
}
