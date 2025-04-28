import {
  getAppRegistry,
} from "@quillsocial/app-store/_appRegistry";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { classNames } from "@quillsocial/lib";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import type { inferSSRProps } from "@quillsocial/types/inferSSRProps";
import type { HorizontalTabItemProps } from "@quillsocial/ui";
import { AllApps, HorizontalTabs, TextField } from "@quillsocial/ui";
import { Search } from "@quillsocial/ui/components/icon";
import type { GetServerSidePropsContext } from "next";
import type { ChangeEventHandler } from "react";
import { useState } from "react";

import PageWrapper from "@components/PageWrapper";
import AppsLayout from "@components/apps/layouts/AppsLayout";

import { ssrInit } from "@server/lib/ssr";

const tabs: HorizontalTabItemProps[] = [
  {
    name: "app_store",
    href: "/apps",
  },
  {
    name: "installed_apps",
    href: "/apps/installed",
  },
];

function AppsSearch({
  onChange,
  className,
}: {
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
}) {
  return (
    <TextField
      className="bg-subtle !border-muted !pl-0 focus:!ring-offset-0"
      addOnLeading={<Search className="text-subtle h-4 w-4" />}
      addOnClassname="!border-muted"
      containerClassName={classNames("focus:!ring-offset-0 m-1", className)}
      type="search"
      autoComplete="false"
      onChange={onChange}
    />
  );
}

export default function Apps({
  appStore,
}: inferSSRProps<typeof getServerSideProps>) {
  const { t } = useLocale();
  const [searchText, setSearchText] = useState<string | undefined>(undefined);

  return (
    <AppsLayout
      isPublic
      heading={t("app_store")}
      subtitle={t("app_store_description")}
      actions={(className) => (
        <div className="flex w-full flex-col pt-4 md:flex-row md:justify-between md:pt-0 lg:w-auto">
          <div className="ltr:mr-2 rtl:ml-2 lg:hidden">
            <HorizontalTabs tabs={tabs} />
          </div>
          <div>
            <AppsSearch
              className={className}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      )}
      headerClassName="sm:hidden lg:block hidden"
      emptyStore={!appStore.length}
    >
      <div className="flex flex-col gap-y-8">
        <AllApps apps={appStore} />
      </div>
    </AppsLayout>
  );
}

Apps.PageWrapper = PageWrapper;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res } = context;

  const ssr = await ssrInit(context);

  const session = await getServerSession({ req, res });

  // let appStore, userAdminTeams: UserAdminTeams;
  const appStore = await getAppRegistry();
  // if (session?.user?.id) {
  //   appStore = await getAppRegistryWithCredentials(session.user.id, userAdminTeams);
  // } else {
  //   appStore = await getAppRegistry();
  // }

  return {
    props: {
      appStore,
      trpcState: ssr.dehydrate(),
    },
  };
};
