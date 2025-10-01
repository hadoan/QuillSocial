import SocialAvatar from "./SocialAvatar";
import useAddAppMutation from "@quillsocial/app-store/_utils/useAddAppMutation";
import { trpc } from "@quillsocial/trpc/react";
import { Dialog as AccessDialog, DialogContent } from "@quillsocial/ui";
import { showToast, useAppDefaultTheme, ErrorBoundary } from "@quillsocial/ui";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState, useRef } from "react";

interface LoadingMap {
  [key: string]: boolean;
}
export const ModalAccount = ({
  showModal,
  onClose,
}: {
  showModal: any;
  onClose: any;
}) => {
  const [listAccount, setListAccount] = useState<any>();
  const socialAccounts = trpc.viewer.socials.getSocialNetWorking.useQuery();
  const [loadingMap, setLoadingMap] = useState<LoadingMap>({});
  const [accountId, setAccountId] = useState<number | null>(null);
  const [pageId, setPageId] = useState<string | undefined | null>(null);

  const router = useRouter();

  const updateMutation = trpc.viewer.socials.setCurrentUserProfile.useMutation({
    onSuccess: () => {
      showToast("Set current profile successfully!", "success");
      if (accountId !== null) {
        setLoadingMap({ ...loadingMap, [`${accountId}_${pageId}`]: false });
        router.reload();
        onClose();
      }
    },
    onError: () => {
      showToast("Error occured when update, please try again.", "error");
      onClose();
    },
  });
  useEffect(() => {
    if (socialAccounts.data) {
      setListAccount(socialAccounts.data);
    }
  }, [socialAccounts.data]);

  const mutation = useAddAppMutation(null, {
    onSuccess: (data) => {
      if (data?.setupPending) return;
    },
    onError: (error) => {
      if (error instanceof Error)
        showToast(
          error.message || "Error while add new Twitter Account",
          "error"
        );
    },
  });

  const handleAccountClick = (accountId: number, pageId?: string) => {
    setLoadingMap({ ...loadingMap, [`${accountId}_${pageId}`]: true });
    setAccountId(accountId);
    setPageId(pageId);

    const id = accountId;
    updateMutation.mutate({ id, pageId });
    const updatedListAccount = listAccount.map((account: any) => {
      if (
        account.id === accountId &&
        (!account.pageId || account.pageId === pageId)
      ) {
        return { ...account, isUserCurrentProfile: true };
      } else {
        return { ...account, isUserCurrentProfile: false };
      }
    });
    setListAccount(updatedListAccount);
  };

  const handleAddNewAccount = (type: any, variant: string, slug: string) => {
    mutation.mutate({ type, variant, slug });
  };

  return (
    <>
      {showModal && (
        <AccessDialog open={showModal} onOpenChange={onClose}>
          <DialogContent className="overflow-y-auto pb-[50px] max-w-md w-full">
            <div className="flex flex-col">
              {listAccount &&
                listAccount.length !== null &&
                listAccount.map((account: any, index: number) => {
                  // Handle special case for API Keys
                  let displayName = account.name;
                  let displayAvatarUrl = account.avatarUrl;
                  let isApiKeys = false;

                  if (account.appId === "xconsumerkeys-social") {
                    displayName = "API Keys";
                    displayAvatarUrl = `/logo/xconsumerkeys-social-logo.svg`;
                    isApiKeys = true;
                  }

                  return (
                    <div
                      key={`${account.id}_${account.pageId}`}
                      id={`${account.id}_${account.pageId}`}
                      onClick={() =>
                        handleAccountClick(account.id, account.pageId)
                      }
                      className={`group mt-4 flex min-h-[80px] items-center rounded-xl border bg-white px-4 shadow-md transition-all duration-150 cursor-pointer hover:shadow-lg hover:bg-blue-50 active:scale-[0.98] ${
                        account.isUserCurrentProfile
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200"
                      } ${isApiKeys ? "bg-gray-50 border-dashed" : ""}`}
                      style={{ position: "relative" }}
                    >
                      <div className="relative flex items-center w-full py-3">
                        <SocialAvatar
                          size="mdLg"
                          appId={account.appId}
                          avatarUrl={displayAvatarUrl}
                        />
                        <span
                          className={`ml-5 font-bold text-lg flex items-center ${
                            isApiKeys ? "text-gray-700" : ""
                          }`}
                        >
                          {displayName}
                          {isApiKeys && (
                            <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600 border border-gray-300">
                              API
                            </span>
                          )}
                        </span>
                        {loadingMap[`${account.id}_${account.pageId}`] && (
                          <span className="ml-2 h-6 w-6 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500"></span>
                        )}
                      </div>
                      {index < listAccount.length - 1 && (
                        <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-200" />
                      )}
                    </div>
                  );
                })}

              <div className="mt-6 flex min-h-[60px] cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-center shadow-sm transition-all hover:bg-blue-100">
                <span
                  className="my-auto text-center font-bold text-lg text-blue-700"
                  onClick={() => {
                    handleAddNewAccount(
                      "linkedin_social",
                      "linkedin",
                      "social"
                    );
                  }}
                >
                  + Add New LinkedIn Account
                </span>
              </div>
            </div>
          </DialogContent>
        </AccessDialog>
      )}
    </>
  );
};
