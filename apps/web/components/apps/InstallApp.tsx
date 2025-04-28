import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import useAddAppMutation from "@quillsocial/app-store/_utils/useAddAppMutation";
import { InstallAppButton } from "@quillsocial/app-store/components";
import DisconnectIntegration from "@quillsocial/features/apps/components/DisconnectIntegration";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import type { App as AppType } from "@quillsocial/types/App";
import {
  Button,
  showToast,
  SkeletonButton,
  Dialog,
  DialogFooter,
  DialogContent,
  Form,
  TextField,
} from "@quillsocial/ui";
import { Check, Plus } from "@quillsocial/ui/components/icon";

import ManageAppLink from "./ManageAppLink";

export interface MediumKeysForm {
  integrationToken: string;
}
export interface DefaultForm {}
export default function InstallApp({
  type,
  slug,
  variant,
  isGlobal = false,
  dependencies,
  allowedMultipleInstalls,
  isInputDialog,
  inputKeys,
  inputDialogTitle,
}: {
  type: AppType["type"];
  isGlobal?: AppType["isGlobal"];
  slug: string;
  variant: string;
  dependencies?: string[];
  allowedMultipleInstalls: boolean;
  isInputDialog?: boolean;
  inputKeys?: { code: string; name: string }[];
  inputDialogTitle?: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [existingCredentials, setExistingCredentials] = useState<number[]>([]);

  const [isModalUpgrade, setIsModalUpgrade] = useState(false);
  const [inputDialogOpen, setInputDialogOpen] = useState(false);

  // const appCredentials = trpc.viewer.appCredentialsByType.useQuery(
  //   { appType: type },
  //   {
  //     onSuccess(data) {
  //       setExistingCredentials(data);
  //     },
  //   }
  // );

  const appCredentials = trpc.viewer.appCredentialsByType.useQuery({ appType: type });

  useEffect(
    function refactorMeWithoutEffect() {
      const data = appCredentials.data;
      if (data) {
        setExistingCredentials(data);
      }
    },
    [appCredentials.data]
  );

  const dependencyData = trpc.viewer.appsRouter.queryForDependencies.useQuery(dependencies, {
    enabled: !!dependencies,
  });

  const disableInstall =
    dependencyData.data && dependencyData.data.some((dependency) => !dependency.installed);

  const mutation = useAddAppMutation(null, {
    onSuccess: (data) => {
      if (data?.setupPending) return;
      showToast(t("app_successfully_installed"), "success");
    },
    onError: (error) => {
      if (error instanceof Error) showToast(error.message || t("app_could_not_be_installed"), "error");
    },
  });

  const saveKeys = async (keyData: any) => {
    const url = WEBAPP_URL + `/api/integrations/${type.replace("_", "")}/saveToken`;

    const response = await fetch(url, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keyData),
    });
    if (!response.ok) {
      const errorStatus = await response.json();
      showToast(errorStatus.message, "error");
      console.error("Failed to update data ", errorStatus);
    } else {
      showToast("Save key data successfully!", "success");
      resetFields();
      const link = "/apps/installed/social";
      router.push(link);
    }
  };
  const mediumKeysFormMethods = useForm<MediumKeysForm>();
  const defaultForm = useForm<DefaultForm>();

  const resetFields = () => {
    mediumKeysFormMethods.reset();
    mediumKeysFormMethods.setValue("integrationToken", "");
  };

  const getKeysFormMethods = (appType: string) => {
    if (appType === "medium_social") {
      return mediumKeysFormMethods;
    }
    return defaultForm;
  };

  return (
    <div>
      {!appCredentials.isLoading ? (
        isGlobal ||
        (existingCredentials.length > 0 && allowedMultipleInstalls ? (
          <div className="flex space-x-3">
            <Button
              className="px-2 py-4 text-sm lg:px-4 lg:py-2"
              StartIcon={Check}
              color="secondary"
              disabled>
              {existingCredentials.length > 0
                ? t("active_install", { count: existingCredentials.length })
                : t("default")}
            </Button>
            {existingCredentials.length > 0 && <ManageAppLink type={type}></ManageAppLink>}
            {!isGlobal && (
              <InstallAppButton
                type={type}
                disableInstall={disableInstall}
                render={({ useDefaultComponent, ...props }) => {
                  if (useDefaultComponent) {
                    props = {
                      ...props,
                      onClick: () => {
                        // mutation.mutate({ type, variant, slug });
                        if (!isInputDialog) {
                          mutation.mutate({ type, variant, slug });
                        } else {
                          setInputDialogOpen(true);
                        }
                      },
                      loading: mutation.isLoading,
                    };
                  }
                  return (
                    <Button
                      className="px-2 py-1 text-sm text-white lg:px-4 lg:py-2"
                      StartIcon={Plus}
                      {...props}
                      // @TODO: Overriding color and size prevent us from
                      // having to duplicate InstallAppButton for now.
                      color="primary"
                      size="base"
                      data-testid="install-app-button">
                      {t("install_another")}
                    </Button>
                  );
                }}
              />
            )}
          </div>
        ) : existingCredentials.length > 0 ? (
          <div className="flex space-x-3">
            {existingCredentials.length > 0 && <ManageAppLink type={type}></ManageAppLink>}
            <DisconnectIntegration
              buttonProps={{ color: "secondary" }}
              label={t("disconnect")}
              credentialId={existingCredentials[0]}
              onSuccess={() => {
                appCredentials.refetch();
              }}
            />
          </div>
        ) : (
          <div className="flex space-x-3">
            {existingCredentials.length > 0 && <ManageAppLink type={type}></ManageAppLink>}
            <InstallAppButton
              type={type}
              disableInstall={disableInstall}
              render={({ useDefaultComponent, ...props }) => {
                if (useDefaultComponent) {
                  props = {
                    ...props,
                    onClick: () => {
                      if (!isInputDialog) {
                        mutation.mutate({ type, variant, slug });
                      } else {
                        setInputDialogOpen(true);
                      }
                    },
                    loading: mutation.isLoading,
                  };
                }
                return (
                  <Button
                    className="px-2 py-1 text-sm text-white lg:px-4 lg:py-2"
                    data-testid="install-app-button"
                    {...props}
                    // @TODO: Overriding color and size prevent us from
                    // having to duplicate InstallAppButton for now.
                    color="primary"
                    size="base">
                    {t("install_app")}
                  </Button>
                );
              }}
            />
          </div>
        ))
      ) : (
        <SkeletonButton className="h-10 w-24" />
      )}
      <>
        <Dialog open={isModalUpgrade} onOpenChange={setIsModalUpgrade}>
          <DialogContent>
            <div>
              <div className="flex items-center justify-center">
                <div className="text-center text-[20px] font-bold">Upgrade</div>
              </div>
              <div className="text-default mt-10 text-center text-[16px]">
                <p>Please upgrade your subscription plan to use.</p>
              </div>
            </div>
            <DialogFooter className=" mt-6 flex items-center justify-center">
              <Button
                className="bg-default hover:bg-awstbgbt hover:text-awst text-awst"
                onClick={() => setIsModalUpgrade(false)}>
                Close
              </Button>
              <Button type="submit" className="text-white" onClick={() => router.push("/billing/overview")}>
                Upgrade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>

      <>
        <Dialog open={inputDialogOpen} onOpenChange={setIsModalUpgrade}>
          <DialogContent>
            <Form
              form={getKeysFormMethods(type) as any}
              handleSubmit={async (values) => {
                await saveKeys(values);
              }}>
              <div>
                <div className="flex items-center justify-center">
                  <div className="text-center text-[20px] font-bold">{inputDialogTitle}</div>
                </div>

                <div className="text-default mt-10  text-[16px]">
                  {inputKeys?.map((key, index) => (
                    <Controller
                      name={key.code as any}
                      control={getKeysFormMethods(type).control as any}
                      rules={{
                        required: "Please insert value for " + key.name,
                        validate: (value) => {
                          if (!value) return `${key.name} is required.`;
                        },
                      }}
                      render={({ field: { onChange }, fieldState: { error } }) => (
                        <>
                          <TextField
                            label={key.name}
                            id={key.code}
                            name={key.code}
                            placeholder=""
                            required
                            onChange={(e) => {
                              onChange(e.target.value.trim());
                            }}
                          />
                          {error && <span className="text-sm text-red-800">{error.message}</span>}
                        </>
                      )}
                    />
                  ))}
                </div>
              </div>
              <DialogFooter className=" mt-6 flex items-center justify-center">
                <Button
                  className="bg-default hover:bg-awstbgbt hover:text-awst text-awst"
                  onClick={() => setInputDialogOpen(false)}>
                  Close
                </Button>
                <Button type="submit" className="text-white">
                  Save
                </Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
}
