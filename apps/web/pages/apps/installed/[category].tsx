import { useRouter } from "next/router";
import { useCallback, useReducer, useState } from "react";
import z from "zod";

import { AppSettings } from "@quillsocial/app-store/_components/AppSettings";
import { InstallAppButton } from "@quillsocial/app-store/components";
import DisconnectIntegrationModal from "@quillsocial/features/apps/components/DisconnectIntegrationModal";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { AppCategories } from "@quillsocial/prisma/enums";
import type { RouterOutputs } from "@quillsocial/trpc/react";
import { trpc } from "@quillsocial/trpc/react";
import type { App } from "@quillsocial/types/App";
import type { AppGetServerSidePropsContext } from "@quillsocial/types/AppGetServerSideProps";
import {
  Alert,
  Button,
  EmptyScreen,
  List,
  AppSkeletonLoader as SkeletonLoader,
  ShellSubHeading,
  DropdownMenuTrigger,
  DropdownMenuContent,
  Dropdown,
  DropdownMenuItem,
  DropdownItem,
  showToast,
} from "@quillsocial/ui";
import type { LucideIcon } from "@quillsocial/ui/components/icon";
import {
  BarChart,
  Bot,
  Calendar,
  Contact,
  CreditCard,
  Grid,
  Mail,
  MoreHorizontal,
  Share2,
  Trash,
  Video,
} from "@quillsocial/ui/components/icon";

import { QueryCell } from "@lib/QueryCell";

import AppListCard from "@components/AppListCard";
import PageWrapper from "@components/PageWrapper";
import { PageSwitch } from "@components/apps/PageSwitch";
import InstalledAppsLayout from "@components/apps/layouts/InstalledAppsLayout";

function ConnectOrDisconnectIntegrationMenuItem(props: {
  credentialIds: number[];
  type: App["type"];
  isGlobal?: boolean;
  installed?: boolean;
  invalidCredentialIds?: number[];
  handleDisconnect: (credentialId: number) => void;
}) {
  const { type, credentialIds, isGlobal, installed, handleDisconnect } = props;
  const { t } = useLocale();
  const [credentialId] = credentialIds;

  const utils = trpc.useContext();
  const handleOpenChange = () => {
    utils.viewer.integrations.invalidate();
  };

  if (credentialId || type === "stripe_payment" || isGlobal) {
    return (
      <DropdownMenuItem>
        <DropdownItem
          color="destructive"
          onClick={() => handleDisconnect(credentialId)}
          disabled={isGlobal}
          StartIcon={Trash}>
          {t("remove_app")}
        </DropdownItem>
      </DropdownMenuItem>
    );
  }

  if (!installed) {
    return (
      <div className="flex items-center truncate">
        <Alert severity="warning" title={t("not_installed")} />
      </div>
    );
  }

  return (
    <InstallAppButton
      type={type}
      render={(buttonProps) => (
        <Button color="secondary" {...buttonProps} data-testid="integration-connection-button">
          {t("install")}
        </Button>
      )}
      onChanged={handleOpenChange}
    />
  );
}

interface IntegrationsContainerProps {
  variant?: AppCategories;
  exclude?: AppCategories[];
  handleDisconnect: (credentialId: number) => void;
}

interface IntegrationsListProps {
  variant?: IntegrationsContainerProps["variant"];
  data: RouterOutputs["viewer"]["integrations"];
  handleDisconnect: (credentialId: number) => void;
}

const IntegrationsList = ({ data, handleDisconnect, variant }: IntegrationsListProps) => {
  const utils = trpc.useContext();
  const [bulkUpdateModal, setBulkUpdateModal] = useState(false);

  const listAccount = trpc.viewer.socials.getSocialNetWorking.useQuery();

  const onSuccessCallback = useCallback(() => {
    setBulkUpdateModal(true);
    showToast("Default app updated successfully", "success");
  }, []);

  const updateDefaultAppMutation = trpc.viewer.updateUserDefaultConferencingApp.useMutation({
    onSuccess: () => {
      showToast("Default app updated successfully", "success");
      utils.viewer.getUsersDefaultConferencingApp.invalidate();
    },
    onError: (error) => {
      showToast(`Error: ${error.message}`, "error");
    },
  });

  const { t } = useLocale();
  return (
    <>
      <div>
        {data.items
          .filter((item) => item.invalidCredentialIds)
          .map((item) => {
            const appSlug = item?.slug;

            let emailOrUserName = "";
            if (listAccount.data) {
              const accounts = listAccount.data.find((a) => a.id === item.credentialIds[0]);
              if (accounts) {
                emailOrUserName = accounts.emailOrUserName || "";
              }
            }
            return (
              <div className="border-subtle my-5 rounded-md border" key={item.name}>
                <AppListCard
                  key={item.name}
                  description={emailOrUserName}
                  title={item.name}
                  logo={item.logo}
                  isDefault={false}
                  shouldHighlight
                  slug={item.slug}
                  invalidCredential={item.invalidCredentialIds.length > 0}
                  actions={
                    <div className="flex justify-end">
                      <Dropdown modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button StartIcon={MoreHorizontal} variant="icon" color="secondary" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <ConnectOrDisconnectIntegrationMenuItem
                            credentialIds={item.credentialIds}
                            type={item.type}
                            isGlobal={item.isGlobal}
                            installed
                            invalidCredentialIds={item.invalidCredentialIds}
                            handleDisconnect={handleDisconnect}
                          />
                        </DropdownMenuContent>
                      </Dropdown>
                    </div>
                  }>
                  {/* <hr/>
                <div className="ml-3 text-sm text-subtle mt-2">Select page to post your status</div>
                <div className="ml-3 pb-2">
                  {fakeData.map((i) => (
                    <PageSwitch
                      key={i.externalId}
                      externalId={i.externalId}
                      title={i.name || "Nameless calendar"}
                      name={i.name || "Nameless calendar"}
                      type={`text`}
                      isChecked={i.isSelected}
                    />
                  ))}
                </div> */}
                  <AppSettings slug={item.slug} />
                </AppListCard>
              </div>
            );
          })}
      </div>

      {/* {bulkUpdateModal && (
        <BulkEditDefaultConferencingModal open={bulkUpdateModal} setOpen={setBulkUpdateModal} />
      )} */}
    </>
  );
};

const IntegrationsContainer = ({
  variant,
  exclude,
  handleDisconnect,
}: IntegrationsContainerProps): JSX.Element => {
  const { t } = useLocale();
  const query = trpc.viewer.integrations.useQuery({ variant, exclude, onlyInstalled: true });

  // TODO: Refactor and reuse getAppCategories?
  const emptyIcon: Record<AppCategories, LucideIcon> = {
    calendar: Calendar,
    conferencing: Video,
    automation: Share2,
    analytics: BarChart,
    payment: CreditCard,
    web3: BarChart, // deprecated
    other: Grid,
    video: Video, // deprecated
    messaging: Mail,
    crm: Contact,
    social: Share2,
    cloudstorage: CreditCard,
    ai: Bot 
  };

  return (
    <QueryCell
      query={query}
      customLoader={<SkeletonLoader />}
      success={({ data }) => {
        if (!data.items.length) {
          return (
            <EmptyScreen
              Icon={emptyIcon[variant || "other"]}
              headline={t("no_category_apps", {
                category: (variant && t(variant).toLowerCase()) || t("other").toLowerCase(),
              })}
              description={t(`no_category_apps_description_${variant || "other"}`)}
              // buttonRaw={
              //   <Button
              //     color="secondary"
              //     data-testid={`connect-${variant || "other"}-apps`}
              //     href={variant ? `/apps/categories/${variant}` : "/apps/categories/other"}>
              //     {t(`connect_${variant || "other"}_apps`)}
              //   </Button>
              // }
            />
          );
        }
        return (
          <div className="border-subtle rounded-md border p-7">
            <ShellSubHeading
              title={t(variant || "other")}
              subtitle={t(`installed_app_${variant || "other"}_description`)}
              className="mb-6"
              // actions={
              //   <Button
              //     href={variant ? `/apps/categories/${variant}` : "/apps"}
              //     color="secondary"
              //     StartIcon={Plus}>
              //     {t("add")}
              //   </Button>
              // }
            />
            <IntegrationsList handleDisconnect={handleDisconnect} data={data} variant={variant} />
          </div>
        );
      }}
    />
  );
};

const querySchema = z.object({
  category: z.nativeEnum(AppCategories),
});

type querySchemaType = z.infer<typeof querySchema>;

type ModalState = {
  isOpen: boolean;
  credentialId: null | number;
};

export default function InstalledApps() {
  const { t } = useLocale();
  const router = useRouter();
  const category = router.query.category as querySchemaType["category"];

  const categoryList: AppCategories[] = Object.values(AppCategories).filter((category) => {
    // Exclude calendar and other from categoryList, we handle those slightly differently below
    return !(category in { other: null, calendar: null });
  });

  const [data, updateData] = useReducer(
    (data: ModalState, partialData: Partial<ModalState>) => ({ ...data, ...partialData }),
    {
      isOpen: false,
      credentialId: null,
    }
  );

  const handleModelClose = () => {
    updateData({ isOpen: false, credentialId: null });
  };

  const handleDisconnect = (credentialId: number) => {
    updateData({ isOpen: true, credentialId });
  };

  return (
    <>
      <InstalledAppsLayout heading={t("installed_apps")} subtitle={t("manage_your_connected_apps")}>
        {categoryList.includes(category) && (
          <IntegrationsContainer handleDisconnect={handleDisconnect} variant={category} />
        )}
        {/* {category === "calendar" && <CalendarListContainer />} */}
        {category === "other" && (
          <IntegrationsContainer
            handleDisconnect={handleDisconnect}
            variant={category}
            exclude={[...categoryList, "calendar"]}
          />
        )}
      </InstalledAppsLayout>
      <DisconnectIntegrationModal
        handleModelClose={handleModelClose}
        isOpen={data.isOpen}
        credentialId={data.credentialId}
      />
    </>
  );
}

// Server side rendering
export async function getServerSideProps(ctx: AppGetServerSidePropsContext) {
  // get return-to cookie and redirect if needed
  const { cookies } = ctx.req;
  if (cookies && cookies["return-to"]) {
    const returnTo = cookies["return-to"];
    if (returnTo) {
      ctx.res.setHeader("Set-Cookie", "return-to=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT");
      return {
        redirect: {
          destination: `${returnTo}`,
          permanent: false,
        },
      };
    }
  }
  const params = querySchema.safeParse(ctx.params);

  if (!params.success) return { notFound: true };

  return {
    props: {
      category: params.data.category,
    },
  };
}

InstalledApps.PageWrapper = PageWrapper;
