import { useRouter } from "next/router";
import React from "react";

import { getConditionToUpgrade } from "@quillsocial/features/payments/getConditionToUpgrade";
import { BillingType } from "@quillsocial/prisma/enums";

import { trpc } from "@quillsocial/trpc/react";
import {
  Dialog as AccessDialog,
  DialogContent,
  DialogFooter,
  showToast,
  Button,
} from "@quillsocial/ui";

interface ModalUpgradeProps {
  isOpen: boolean;
  onClose: () => void;
}
const ModalUpgrade: React.FC<ModalUpgradeProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const handleUpgrade = () => {
    router.push("/billing/overview");
  };
  return (
    <AccessDialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onClose}
          >
            Close
          </Button>
          <Button type="submit" className="text-white" onClick={handleUpgrade}>
            Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </AccessDialog>
  );
};

export const checkConditionPublishPost = () => {
  const currentBillingQuery =
    trpc.viewer.billings.getCurrentUserBilling.useQuery();
  const getCountSocial =
    trpc.viewer.socials.getSocialConditionsForBilling.useQuery();
  const checkCondition = getConditionToUpgrade(
    getCountSocial.data,
    currentBillingQuery.data?.type ?? BillingType.FREE_TIER
  );
  return checkCondition?.postIsTrue ?? false;
};

export default ModalUpgrade;
