import {
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { trpc } from "@quillsocial/trpc/react";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import useAvatarQuery from "@quillsocial/trpc/react/hooks/useAvatarQuery";
import useMeQuery from "@quillsocial/trpc/react/hooks/useMeQuery";
import { Avatar, HeadSeo, showToast } from "@quillsocial/ui";
import { Dropdown, DropdownItem } from "@quillsocial/ui";
import { useRouter } from "next/router";
import SocialAvatar from "@quillsocial/features/shell/SocialAvatar";
import { useCurrentUserAccount } from "@quillsocial/features/shell/SocialAvatar";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface LoadingMap {
  [key: string]: boolean;
}

interface UpdateMutationProps {
  accountId: number | null;
}

const useUpdateMutation = ({ accountId }: UpdateMutationProps) => {
  const router = useRouter();
  const update = trpc.viewer.socials.setCurrentUserProfile.useMutation({
    onSuccess: () => {
      showToast("Set current profile successfully!", "success");
      if (accountId !== null) {
        router.reload();
      }
    },
    onError: () => {
      showToast("Error occurred when updating, please try again.", "error");
    },
  });

  return update;
};

export function SocialAccountUserDropdown() {
  const { data: user } = useMeQuery();
  const [listAccount, setListAccount] = useState<any>();
  const socialAccounts = trpc.viewer.socials.getSocialNetWorking.useQuery();
  const [accountId, setAccountId] = useState<number | null>(null);
  const [hasSorted, setHasSorted] = useState(false);
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentAvatar = useCurrentUserAccount();

  useEffect(() => {
    if (socialAccounts.data) {
      setListAccount(socialAccounts.data);
    }
  }, [socialAccounts.data]);

  useEffect(() => {
    if (!hasSorted && listAccount && listAccount.length > 0) {
      const sortedAccounts = [...listAccount].sort((a: any, b: any) => {
        if (a.isUserCurrentProfile && !b.isUserCurrentProfile) {
          return -1;
        } else if (!a.isUserCurrentProfile && b.isUserCurrentProfile) {
          return 1;
        }
        return 0;
      });
      setListAccount(sortedAccounts);
      setHasSorted(true);
    }
  }, [listAccount, hasSorted]);

  const update = useUpdateMutation({ accountId });

  const handleAccountClick = (accountId: number) => {
    setAccountId(accountId);
    update.mutate({ id: accountId });
    const updatedListAccount = listAccount.map((account: any) => {
      if (account.id === accountId) {
        return { ...account, isUserCurrentProfile: true };
      } else {
        return { ...account, isUserCurrentProfile: false };
      }
    });
    setListAccount(updatedListAccount);
    setMenuOpen(false);
  };
  useEffect(() => {
    //@ts-ignore
    const Beacon = window.Beacon;
    // window.Beacon is defined when user actually opens up HelpScout and username is available here. On every re-render update session info, so that it is always latest.
    Beacon &&
      Beacon("session-data", {
        username: user?.username || "Unknown",
        screenResolution: `${screen.width}x${screen.height}`,
      });
  });

  if (!user) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Dropdown open={menuOpen}>
        <DropdownMenuTrigger
          asChild
          onClick={() => setMenuOpen((menuOpen) => !menuOpen)}
        >
          <button
            className="bg-default ml-[-10px]] group mx-0 flex cursor-pointer appearance-none items-center rounded-full py-1.5 pl-[5px] text-left outline-none hover:bg-slate-200 focus:outline-none focus:ring-0
                md:rounded-none lg:rounded"
          >
            <span
              className="relative  h-5 w-5 flex-shrink-0 items-center justify-center
                  rounded-full  ltr:mr-2 rtl:ml-2"
            >
              {currentAvatar && (
                <div>
                  <SocialAvatar
                    size="sm"
                    appId={currentAvatar.appId!}
                    avatarUrl={currentAvatar.avatarUrl!}
                  />
                </div>
              )}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            onInteractOutside={() => {
              setMenuOpen(false);
              setHelpOpen(false);
            }}
            className="group bg-white border overflow-hidden rounded-md"
          >
            <>
              {listAccount && listAccount.length > 0 && (
                <div>
                  {listAccount.map((account: any, index: number) => (
                    <div key={index}>
                      <DropdownMenuItem>
                        <DropdownItem
                          type="button"
                          onClick={() => {
                            handleAccountClick(account.id);
                          }}
                        >
                          <span
                            className={
                              account.isUserCurrentProfile ? "font-bold" : ""
                            }
                          >
                            {account.name || user.name || "Nameless User"}
                          </span>
                        </DropdownItem>
                      </DropdownMenuItem>
                      {<hr />}
                    </div>
                  ))}
                </div>
              )}
              <DropdownMenuItem>
                <DropdownItem className="">
                  <span
                    onClick={() =>
                      router.push("/settings/my-account/app-integrations")
                    }
                    className="text-awst text-[12px] text-sm"
                  >
                    Add another account
                  </span>
                </DropdownItem>
              </DropdownMenuItem>
              <DropdownMenuItem></DropdownMenuItem>
            </>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </Dropdown>
    </>
  );
}
