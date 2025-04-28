import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Dialog, DialogContent, DialogFooter } from "@quillsocial/ui";

interface EmojiDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string | null) => void;
}

export const EmojiDialog: React.FC<EmojiDialogProps> = ({
  open,
  onClose,
  onSelectEmoji,
}) => {
  const onEmojiClick = (emojiObject: any, event: MouseEvent) => {
    onSelectEmoji(emojiObject.emoji);
    onClose();
  };

  return (
    <Dialog open={open} {...(onClose ? { onClose: onClose } : {})}>
      <DialogContent style={{ width: "420px" }}>
        <div className="flex flex-col items-center">
          <div
            onClick={onClose}
            className="rounded-full ml-auto h-[40px] hover:cursor-pointer flex justify-center items-center text-center w-[40px] mr-[-23px] border-none hover:border-none focus:border-none mt-[-25px] hover:bg-red-100 bg-white text-red-700"
          >
            &times;
          </div>
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
