import React from "react";

import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { trpc } from "@quillsocial/trpc/react";
import { Avatar } from "@quillsocial/ui";

interface SocialAvatarProps {
  avatarUrl: string;
  name?: string;
  appId: string;
  size: string;
}

const SocialAvatar: React.FC<SocialAvatarProps> = ({ avatarUrl, name, size, appId }) => {
  const mappedSize =
    size === "xxs" ||
    size === "xs" ||
    size === "xsm" ||
    size === "sm" ||
    size === "md" ||
    size === "mdLg" ||
    size === "lg" ||
    size === "xl"
      ? size
      : "mdLg";
  const imgClass = mappedSize === "sm" ? "ml-3 h-2 w-3" : "ml-8 h-4 w-4";
  return (
    <div className="relative flex items-center">
      <Avatar
        size={mappedSize}
        imageSrc={avatarUrl || ""}
        alt={name || "Nameless User"}
        className="relative z-10 overflow-hidden"
      />
      <img
        src={`${WEBAPP_URL}/logo/${appId}-logo.svg`}
        alt={appId}
        className={`absolute z-10 mt-5 rounded ${imgClass}`}
      />
    </div>
  );
};

export function useCurrentUserAccount() {
  const socialAccounts = trpc.viewer.socials.getSocialNetWorking.useQuery();
  if (!socialAccounts.data) {
    return undefined;
  }

  return socialAccounts.data.find((account) => account.isUserCurrentProfile);
}

export function checkUserToUsePlug() {
  const currentUser = useCurrentUserAccount();
  if (
    // currentUser?.appId == `linkedin-social` ||
    currentUser?.appId == `x-social` ||
    currentUser?.appId == `twitterv1-social`
  ) {
    return true;
  }
  return false;
}

export default SocialAvatar;
