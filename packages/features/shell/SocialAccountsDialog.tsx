import { Dialog as AccessDialog, DialogContent } from "@quillsocial/ui";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { trpc } from "@quillsocial/trpc/react";
import { useRouter } from "next/router";
import useAddAppMutation from "@quillsocial/app-store/_utils/useAddAppMutation";
import SocialAvatar from "./SocialAvatar";
import {
    showToast,
    useAppDefaultTheme,
    ErrorBoundary,
  } from "@quillsocial/ui";

interface LoadingMap {
    [key: string]: boolean;
  }
  export const ModalAccount = ({ showModal, onClose }: { showModal: any; onClose: any }) => {
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
        if (error instanceof Error) showToast(error.message || "Error while add new Twitter Account", "error");
      },
    });
  
    const handleAccountClick = (accountId: number, pageId?: string) => {
      setLoadingMap({ ...loadingMap, [`${accountId}_${pageId}`]: true });
      setAccountId(accountId);
      setPageId(pageId);
  
      const id = accountId;
      updateMutation.mutate({ id, pageId });
      const updatedListAccount = listAccount.map((account: any) => {
        if (account.id === accountId && (!account.pageId || account.pageId === pageId)) {
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
            <DialogContent className="overflow-y-auto pb-[50px]">
              <div className="flex flex-col">
                {listAccount &&
                  listAccount.length !== null &&
                  listAccount.map((account: any, index: number) => (
                    <div
                      key={`${account.id}_${account.pageId}`}
                      id={`${account.id}_${account.pageId}`}
                      onClick={() => handleAccountClick(account.id, account.pageId)}
                      className={` ${
                        account.isUserCurrentProfile
                          ? "bg-awst hover:bg-awst mt-5 flex min-h-[70px] items-center rounded-lg border px-3 text-white shadow"
                          : "hover:bg-awst mt-5 flex min-h-[70px] items-center rounded-lg border bg-white px-3 shadow hover:text-white"
                      }`}>
                      <div className="relative flex items-center">
                        <SocialAvatar size="mdLg" appId={account.appId} avatarUrl={account.avatarUrl} />
                        <span className="ml-5 font-bold">{account.name}</span>
                        {loadingMap[`${account.id}_${account.pageId}`] && (
                          <span className="ml-2 h-6 w-6 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500"></span>
                        )}
                      </div>
                    </div>
                  ))}
                {/* <div className="hover:bg-awst mt-5 flex min-h-[70px] cursor-pointer items-center justify-center rounded-lg border  bg-white text-center shadow hover:text-white">
                  <span
                    className="my-auto text-center font-bold"
                    onClick={() => {
                      handleAddNewAccount("x_social", "x", "social");
                    }}>
                    {" "}
                    Add New Twitter Account
                  </span>
                </div> */}
                <div className="hover:bg-awst mt-5 flex min-h-[70px] cursor-pointer items-center justify-center rounded-lg border  bg-white text-center shadow hover:text-white">
                  <span
                    className="my-auto text-center font-bold"
                    onClick={() => {
                      handleAddNewAccount("linkedin_social", "linkedin", "social");
                    }}>
                    {" "}
                    Add New LinkedIn Account
                  </span>
                </div>
              </div>
            </DialogContent>
          </AccessDialog>
        )}
      </>
    );
  };
  