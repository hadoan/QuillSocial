import { appStoreMetadata } from "@quillsocial/app-store/appStoreMetaData";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { isMac } from "@quillsocial/lib/isMac";
import { Tooltip } from "@quillsocial/ui";
import { Search, ArrowUp, ArrowDown, CornerDownLeft, Command } from "@quillsocial/ui/components/icon";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useKBar,
  useMatches,
} from "kbar";
import { useRouter } from "next/router";
import { useMemo } from "react";

type shortcutArrayType = {
  shortcuts?: string[];
};

const getApps = Object.values(appStoreMetadata).map(({ name, slug }) => ({
  id: slug,
  name,
  section: "Installable Apps",
  keywords: `app ${name}`,
}));

export const KBarRoot = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  // grab link to events
  // quick nested actions would be extremely useful

  const actions = useMemo(() => {
    const appStoreActions = getApps.map((item) => ({
      ...item,
      perform: () => router.push(`/apps/${item.id}`),
    }));
    return [
      {
        id: "aiWrite",
        name: "AI Write",
        section: "Ai Write",
        shortcut: ["w", "a"],
        keywords: "ai write",
        perform: () => router.push("/ai-write"),
      },
      {
        id: "write",
        name: "Write",
        section: "Write",
        shortcut: ["w"],
        keywords: "write",
        perform: () => router.push("/write/0"),
      },
      {
        id: "myContent",
        name: "My content",
        section: "My content",
        shortcut: ["m", "c"],
        keywords: "write",
        perform: () => router.push("/my-content/all"),
      },
      {
        id: "calendar",
        name: "Calendar",
        section: "Calendar",
        shortcut: ["c"],
        keywords: "calendar",
        perform: () => router.push("/calendar"),
      },
      {
        id: "profile",
        name: "profile",
        section: "profile",
        shortcut: ["p", "s"],
        keywords: "setting profile",
        perform: () => router.push("/settings/my-account/profile"),
      },
      {
        id: "avatar",
        name: "change_avatar",
        section: "profile",
        shortcut: ["c", "a"],
        keywords: "remove change modify avatar",
        perform: () => router.push("/settings/my-account/profile"),
      },
      // {
      //   id: "password",
      //   name: "change_password",
      //   section: "security",
      //   shortcut: ["c", "p"],
      //   keywords: "change modify password",
      //   perform: () => router.push("/settings/security/password"),
      // },
      {
        id: "billing",
        name: "manage_billing",
        section: "billing",
        shortcut: ["m", "b"],
        keywords: "billing view manage",
        perform: () => router.push("/settings/billing"),
      },
     // ...appStoreActions,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <KBarProvider actions={actions}>{children}</KBarProvider>;
};

export const KBarContent = () => {
  const { t } = useLocale();
  return (
    <KBarPortal>
      <KBarPositioner>
        <KBarAnimator className="bg-default z-10 w-full max-w-screen-sm overflow-hidden rounded-md shadow-lg">
          <div className="border-subtle flex items-center justify-center border-b">
            <Search className="text-default mx-3 h-4 w-4" />
            <KBarSearch
              defaultPlaceholder={t("kbar_search_placeholder")}
              className="bg-default placeholder:text-subtle text-default w-full rounded-sm py-2.5 focus-visible:outline-none"
            />
          </div>
          <RenderResults />
          <div className="text-subtle border-subtle hidden items-center space-x-1 border-t px-2 py-1.5 text-xs sm:flex">
            <ArrowUp className="h-4 w-4" />
            <ArrowDown className="h-4 w-4" /> <span className="pr-2">{t("navigate")}</span>
            <CornerDownLeft className="h-4 w-4" />
            <span className="pr-2">{t("open")}</span>
            {isMac ? <Command className="h-3 w-3" /> : "CTRL"}
            <span className="pr-1">+ K </span>
            <span className="pr-2">{t("close")}</span>
          </div>
        </KBarAnimator>
        <div className="z-1 fixed inset-0 bg-neutral-800 bg-opacity-70" />
      </KBarPositioner>
    </KBarPortal>
  );
};

export const KBarTrigger = () => {
  const { query } = useKBar();
  return query ? (
    <>
      <Tooltip side="right" content={isMac ? "⌘ + K" : "CTRL + K"}>
        <button
          color="minimal"
          onClick={query.toggle}
          className="text-default hover:bg-subtle lg:hover:bg-emphasis lg:hover:text-emphasis group flex rounded-md px-3 py-2 text-sm font-medium lg:px-2">
          <Search className="h-4 w-4 flex-shrink-0 text-inherit" />
        </button>
      </Tooltip>
    </>
  ) : null;
};

const DisplayShortcuts = (item: shortcutArrayType) => {
  const shortcuts = item.shortcuts;

  return (
    <span className="space-x-1">
      {shortcuts?.map((shortcut) => {
        return (
          <kbd
            key={shortcut}
            className="bg-default hover:bg-subtle text-emphasis rounded-sm border px-2 py-1">
            {shortcut}
          </kbd>
        );
      })}
    </span>
  );
};

function RenderResults() {
  const { results } = useMatches();
  const { t } = useLocale();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="bg-default text-emphasis p-4 text-xs font-bold uppercase">{t(item)}</div>
        ) : (
          <div
            // For seeing keyboard up & down navigation in action, we need visual feedback based on "active" prop
            style={{
              background: active ? "var(--quill-bg-subtle)" : `var(--quill-bg-default)`,
              borderLeft: active ? "2px solid var(--quill-border-default)" : "2px solid transparent",
              color: "var(--quillsocial-text)",
            }}
            className="flex items-center justify-between px-4 py-2.5 text-sm hover:cursor-pointer">
            <span>{t(item.name)}</span>
            <DisplayShortcuts shortcuts={item.shortcut} />
          </div>
        )
      }
    />
  );
}
