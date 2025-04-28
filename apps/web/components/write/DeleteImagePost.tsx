import { Dialog, ConfirmationDialogContent } from "@quillsocial/ui";
import { useState } from "react";

interface DeleteImageDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteImageDialog: React.FC<DeleteImageDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <ConfirmationDialogContent
        variety="danger"
        title="Remove imgae"
        confirmBtnText="Confirm"
        loadingText="Confirm"
        onConfirm={(e: any) => {
          onConfirm();
          onClose();
        }}
      >
        <br />
        <a>This image will be remove in the post</a>
      </ConfirmationDialogContent>
    </Dialog>
  );
};
