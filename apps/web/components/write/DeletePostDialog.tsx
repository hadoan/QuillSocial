import { Dialog, ConfirmationDialogContent } from "@quillsocial/ui";
import { useState } from "react";

interface DeletePostDialogProps {
  open: boolean;
  onClose: () => void;
  id: number;
  onDeleteComplete: (success: boolean) => void;
}

export const DeletePostDialog: React.FC<DeletePostDialogProps> = ({
  open,
  onClose,
  id,
  onDeleteComplete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePost = async () => {
    setIsDeleting(true);
    const response = await fetch(`/api/posts/deletePost?id=${id}`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      onDeleteComplete(true);
    } else {
      onDeleteComplete(false);
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <ConfirmationDialogContent
        variety="danger"
        title="Delete Post"
        confirmBtnText="Confirm"
        loadingText="Confirm"
        isLoading={isDeleting}
        onConfirm={(e: any) => {
          e.preventDefault();
          deletePost();
        }}
      >
        <br />
        <a>This post will be delete</a>
      </ConfirmationDialogContent>
    </Dialog>
  );
};
