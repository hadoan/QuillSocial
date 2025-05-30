import { classNames } from "@quillsocial/lib";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import type { AppFrontendPayload as App } from "@quillsocial/types/App";
import type { CredentialFrontendPayload as Credential } from "@quillsocial/types/Credential";
// import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";
import type { UIEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { EmptyScreen } from "../empty-screen";
import { ChevronLeft, ChevronRight, Search } from "../icon";
import { AppCard } from "./AppCard";

export function useShouldShowArrows() {
  const ref = useRef<HTMLUListElement>(null);
  const [showArrowScroll, setShowArrowScroll] = useState({
    left: false,
    right: false,
  });

  useEffect(() => {
    const appCategoryList = ref.current;
    if (
      appCategoryList &&
      appCategoryList.scrollWidth > appCategoryList.clientWidth
    ) {
      setShowArrowScroll({ left: false, right: true });
    }
  }, []);

  const calculateScroll = (e: UIEvent<HTMLUListElement>) => {
    setShowArrowScroll({
      left: e.currentTarget.scrollLeft > 0,
      right:
        Math.floor(e.currentTarget.scrollWidth) -
          Math.floor(e.currentTarget.offsetWidth) !==
        Math.floor(e.currentTarget.scrollLeft),
    });
  };

  return {
    ref,
    calculateScroll,
    leftVisible: showArrowScroll.left,
    rightVisible: showArrowScroll.right,
  };
}

type AllAppsPropsType = {
  apps: (App & { credentials?: Credential[] })[];
  // searchText?: string;
  // categories: string[];
};

interface CategoryTabProps {
  selectedCategory: string | null;
  categories: string[];
  searchText?: string;
}

function CategoryTab({
  selectedCategory,
  categories,
  searchText,
}: CategoryTabProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { ref, calculateScroll, leftVisible, rightVisible } =
    useShouldShowArrows();
  const handleLeft = () => {
    if (ref.current) {
      ref.current.scrollLeft -= 100;
    }
  };

  const handleRight = () => {
    if (ref.current) {
      ref.current.scrollLeft += 100;
    }
  };
  return (
    <div className="relative mb-4 flex flex-col justify-between lg:flex-row lg:items-center">
      <h2 className="text-emphasis hidden text-base font-semibold leading-none sm:block">
        {searchText
          ? t("search")
          : t("category_apps", {
              category:
                (selectedCategory &&
                  selectedCategory[0].toUpperCase() +
                    selectedCategory.slice(1)) ||
                t("all"),
            })}
      </h2>
      {leftVisible && (
        <button
          onClick={handleLeft}
          className="absolute bottom-0 flex md:-top-1 md:left-1/2"
        >
          <div className="bg-default flex h-12 w-5 items-center justify-end">
            <ChevronLeft className="text-subtle h-4 w-4" />
          </div>
          <div className="to-default flex h-12 w-5 bg-gradient-to-l from-transparent" />
        </button>
      )}
      <ul
        className="no-scrollbar mt-3 flex max-w-full space-x-1 overflow-x-auto lg:mt-0 lg:max-w-[50%]"
        onScroll={(e) => calculateScroll(e)}
        ref={ref}
      >
        <li
          onClick={() => {
            router.replace(router.asPath.split("?")[0], undefined, {
              shallow: true,
            });
          }}
          className={classNames(
            selectedCategory === null
              ? "bg-emphasis text-default"
              : "bg-muted text-emphasis",
            "hover:bg-emphasis min-w-max rounded-md px-4 py-2.5 text-sm font-medium hover:cursor-pointer"
          )}
        >
          {t("all")}
        </li>
        {categories.map((cat, pos) => (
          <li
            key={pos}
            onClick={() => {
              if (selectedCategory === cat) {
                router.replace(router.asPath.split("?")[0], undefined, {
                  shallow: true,
                });
              } else {
                router.replace(
                  router.asPath.split("?")[0] + `?category=${cat}`,
                  undefined,
                  {
                    shallow: true,
                  }
                );
              }
            }}
            className={classNames(
              selectedCategory === cat
                ? "bg-emphasis text-default"
                : "bg-muted text-emphasis",
              "hover:bg-emphasis rounded-md px-4 py-2.5 text-sm font-medium hover:cursor-pointer"
            )}
          >
            {cat[0].toUpperCase() + cat.slice(1)}
          </li>
        ))}
      </ul>
      {rightVisible && (
        <button
          onClick={handleRight}
          className="absolute bottom-0 right-0 flex md:-top-1"
        >
          <div className="to-default flex h-12 w-5 bg-gradient-to-r from-transparent" />
          <div className="bg-default flex h-12 w-5 items-center justify-end">
            <ChevronRight className="text-subtle h-4 w-4" />
          </div>
        </button>
      )}
    </div>
  );
}

export function AllApps({ apps }: AllAppsPropsType) {
  const router = useRouter();
  const searchText = "";
  const filteredApps = apps.sort(function (a, b) {
    if (a.name < b.name) return -1;
    else if (a.name > b.name) return 1;
    return 0;
  });

  return (
    <div>
      {filteredApps.length ? (
        <div
          className="grid gap-3 lg:grid-cols-4 [@media(max-width:1270px)]:grid-cols-3 [@media(max-width:500px)]:grid-cols-1 [@media(max-width:730px)]:grid-cols-1"
          ref={null}
        >
          {filteredApps.map((app) => (
            <AppCard
              key={app.name}
              app={app}
              searchText={searchText}
              credentials={app.credentials}
            />
          ))}{" "}
        </div>
      ) : (
        <EmptyScreen
          Icon={Search}
          headline="No results"
          description={searchText}
        />
      )}
    </div>
  );
}
