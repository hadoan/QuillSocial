import { WriteAiDialog } from "@components/write/WriteAiDialog";
import { ReWriteAI } from "@quillsocial/types/ReWriteAI";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  Input,
  TextArea,
} from "@quillsocial/ui";
import { Button } from "@quillsocial/ui";
import { useState } from "react";

interface CustomInstructionDialogProps {
  open: boolean;
  onClose: () => void;
  writeCustomInstruction: (customInstruction: string) => Promise<string>;
  onRetry: (type: ReWriteAI | string) => Promise<void>;
  onCopy: (text: string) => void;
}

export const CustomInstructionDialog: React.FC<
  CustomInstructionDialogProps
> = ({ open, onClose, writeCustomInstruction, onRetry, onCopy }) => {
  const [modalWriteAi, setModalWriteAi] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSettitleModal = async (title: string) => {
    try {
      setIsLoading(true);
      const post = await writeCustomInstruction(customInstruction);
      setPost(post);
      setTitleModal(title);
      setModalWriteAi(true);
      onClose();
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorChange = (e: any) => {
    setCustomInstruction(e.target.value);
  };
  return (
    <>
      <Dialog open={open}>
        <DialogContent className="w-full max-w-xl">
          <div className="flex w-full justify-end">
            <div className="mr-auto flex flex-col">
              <span className="font-bold">Custom Instruction</span>
              <span className="text-sm">Write your custom instruction</span>
            </div>
            <div
              onClick={onClose}
              className="mr-[-23px] mt-[-25px] flex h-[40px] w-[40px] items-center justify-center rounded-full border-none bg-white text-center text-red-700 hover:cursor-pointer hover:border-none hover:bg-red-100 focus:border-none"
            >
              &times;
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex"></div>
            <div className="flex flex-col text-[12px]">
              <TextArea
                rows={6}
                value={customInstruction}
                onChange={handleEditorChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full">
              <div className="ml-auto space-x-2">
                <button
                  onClick={() => handleSettitleModal("Improve Structure")}
                  disabled={isLoading || !customInstruction.trim()}
                  className="bg-awst rounded-xl border px-4 py-2 text-sm text-white hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Go Ahead"}
                </button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={isLoading}>
        <DialogContent className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Generating Content</h3>
              <p className="text-sm text-gray-600">
                Please wait while we process your custom instruction...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {modalWriteAi && (
        <WriteAiDialog
          content={post}
          actionTitle={titleModal}
          open={modalWriteAi}
          onClose={() => setModalWriteAi(false)}
          initialRetryType={customInstruction}
          onCopy={onCopy}
          onRetry={onRetry}
        />
      )}
    </>
  );
};
