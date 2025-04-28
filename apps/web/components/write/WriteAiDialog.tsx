import { useState } from "react";

import { ReWriteAI } from "@quillsocial/types/ReWriteAI";
import { Dialog, DialogContent, DialogFooter, TextArea, showToast } from "@quillsocial/ui";

interface WriteAiDialogProps {
  open: boolean;
  onClose: () => void;
  actionTitle: string;
  content?: string;
  initialRetryType: ReWriteAI | string;
  onRetry: (type: ReWriteAI | string) => Promise<void>;
  onCopy: (text: string) => void;
  isKeepDialogOnCopy?: boolean;
}

export const WriteAiDialog: React.FC<WriteAiDialogProps> = ({
  open,
  onClose,
  actionTitle,
  content,
  onRetry,
  initialRetryType,
  onCopy,
  isKeepDialogOnCopy,
}) => {
  const [isButtonStop, setIsButtonStop] = useState(false);
  const [myContent, setMyContent] = useState(content);
  const retryType = initialRetryType !== undefined ? initialRetryType : ReWriteAI.Complete;

  const handleRetry = async () => {
    if (onRetry) {
      setIsButtonStop(false);
      await onRetry(retryType);
      if (!isKeepDialogOnCopy) onClose();
    }
  };
  const handleCopyAndClose = async () => {
    if (myContent) {
      await navigator.clipboard.writeText(myContent);
      showToast("Copy successfuly", "success");
      onCopy(myContent);
      onClose();
    }
  };

  const handleEditorChange = (e: any) => {
    setMyContent(e.target.value);
  };
  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-xl">
        <div className="flex w-full justify-end">
          <div className="mr-auto font-bold">Rewrite with AI</div>
          <div
            onClick={onClose}
            className="mr-[-23px] mt-[-25px] flex h-[40px] w-[40px] items-center justify-center rounded-full border-none bg-white text-center text-red-700 hover:cursor-pointer hover:border-none hover:bg-red-100 focus:border-none">
            &times;
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex">
            <p className="text-sm font-semibold text-gray-700">{actionTitle}</p>
            <div className="ml-auto flex gap-2">
              {/* <ThumbsUp className="h-5 w-5 hover:text-green-500 hover:cursor-pointer" />
                            <ThumbsDown className="h-5 w-5  hover:text-red-400 hover:cursor-pointer " /> */}
            </div>
          </div>
          <div className="flex flex-col rounded-lg border  border-gray-300 bg-slate-50 p-4 text-[12px]">
            <TextArea rows={20} value={myContent} onChange={handleEditorChange} />
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full">
            {isButtonStop ? (
              <div className="ml-auto">
                <button
                  onClick={() => {
                    setIsButtonStop(false);
                  }}
                  className="rounded-xl border px-4 py-2 text-sm text-red-500">
                  Stop
                </button>
              </div>
            ) : (
              <>
                <div>
                  <button
                    onClick={() => onClose()}
                    className="mr-auto rounded-xl border border-gray-300 bg-transparent px-4 py-2 text-sm hover:bg-gray-100">
                    Discard
                  </button>
                </div>
                <div className="ml-auto space-x-2">
                  <button
                    onClick={() => {
                      handleRetry();
                    }}
                    className="rounded-xl border border-gray-300 bg-transparent px-4 py-2 text-sm hover:bg-gray-100">
                    Retry
                  </button>
                  <button
                    className="rounded-xl bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                    onClick={handleCopyAndClose}>
                    Copy and Close
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
