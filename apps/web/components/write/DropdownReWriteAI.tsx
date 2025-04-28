import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  Star,
  CheckCheck,
  ArrowUpDown,
  CornerRightUp,
  ChevronRight,
  Wand,
  Keyboard,
  AlignStartVertical,
  Brain,
} from "lucide-react";
import { useState } from "react";

import { TrackEventJuneSo, EVENTS } from "@quillsocial/features/june.so/juneso";
import useMeQuery from "@quillsocial/trpc/react/hooks/useMeQuery";
import { ReWriteAI } from "@quillsocial/types/ReWriteAI";
import { Dropdown, DropdownItem, showToast } from "@quillsocial/ui";
import { Dialog, DialogContent } from "@quillsocial/ui";

import { CustomInstructionDialog } from "./CustomInstructionDialog";
import { FormatPostDialog } from "./FormatPostDialog";
import { WriteAiDialog } from "./WriteAiDialog";

export const DropdownReWriteAI = (props: {
  content: string;
  rewriteAction: (instruction: ReWriteAI | string) => Promise<string>;
  onCopyToWritePage: (text: string) => void;
  hasAI?: boolean;
}) => {
  const [modalWriteAI, setModalWriteAI] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [modalCustomInstruction, setModalCustomInstruction] = useState(false);
  const [modalFormatPost, setModalFormatPost] = useState(false);
  const [content, setContent] = useState("");
  const [reTryType, setReTryType] = useState<ReWriteAI | string>();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedContent, setCopiedContent] = useState("");
  const { data: user } = useMeQuery();

  const writeCustomInstruction = async (instruction: string) => {
    return props.rewriteAction(instruction);
  };

  const handleSettitleModalReWriteAI = async (instruction: ReWriteAI | string) => {
    if (!props.hasAI) {
      showToast("Please install ChatGPT app from Apps menu to use this feature", "error");
      return;
    }
    if (user?.id) TrackEventJuneSo({ id: user?.id.toString(), event: `${EVENTS.REWRITE} ${instruction}` });
    setReTryType(instruction);
    setIsLoading(true);
    if (props.rewriteAction) {
      const post = await props.rewriteAction(instruction);
      if (post) {
        setIsLoading(false);
        setContent(post);
        setTitleModal(instruction);
        setModalWriteAI(true);
      }
    }
  };

  const handleRetry = async (type: ReWriteAI | string) => {
    await handleSettitleModalReWriteAI(type);
  };

  return (
    <div className="z-50 bg-white" id="dropdownRewriteAI">
      <Dropdown>
        <DropdownMenuTrigger asChild>
          <button className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white">
            <Brain />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent style={{ minWidth: "200px" }} className="ml-20 bg-white sm:ml-5 md:ml-20">
          {/* <DropdownMenuItem className="focus:ring-muted">
            <DropdownItem
              target="_blank"
              type="button"
              StartIcon={AlignStartVertical}
              onClick={() => setModalFormatPost(true)}
              rel="noreferrer">
              Format Post
            </DropdownItem>
          </DropdownMenuItem> */}
          <DropdownMenuItem className="focus:ring-muted">
            <DropdownItem
              type="button"
              onClick={() => handleSettitleModalReWriteAI(ReWriteAI.Complete)}
              StartIcon={CheckCheck}>
              Complete
            </DropdownItem>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:ring-muted">
            <DropdownItem
              StartIcon={ArrowUpDown}
              onClick={() => handleSettitleModalReWriteAI(ReWriteAI.Shorten)}
              type="button">
              Shorten
            </DropdownItem>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:ring-muted">
            <DropdownItem
              type="button"
              onClick={() => handleSettitleModalReWriteAI(ReWriteAI.GenerateHook)}
              StartIcon={CornerRightUp}>
              Generate a hook
            </DropdownItem>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:ring-muted">
            <DropdownItem
              StartIcon={ChevronRight}
              onClick={() => handleSettitleModalReWriteAI(ReWriteAI.GenerateCTA)}
              type="button">
              Generate a CTA
            </DropdownItem>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:ring-muted">
            <DropdownItem
              type="button"
              StartIcon={Wand}
              onClick={() => handleSettitleModalReWriteAI(ReWriteAI.ImproveStructure)}>
              Improve Structure
            </DropdownItem>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:ring-muted text-[10px] text-sm">
            <DropdownItem
              StartIcon={Keyboard}
              type="button"
              onClick={() => {
                if (!props.hasAI) {
                  showToast("Please install ChatGPT app from Apps menu to use this feature", "error");
                  return;
                }
                setModalCustomInstruction(true);
                if (user?.id)
                  TrackEventJuneSo({
                    id: user?.id.toString(),
                    event: `${EVENTS.REWRITE} Custom Insstruction`,
                  });
              }}>
              Custom Instruction
            </DropdownItem>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </Dropdown>
      <>
        {modalWriteAI && (
          <WriteAiDialog
            actionTitle={titleModal}
            open={modalWriteAI}
            onClose={() => setModalWriteAI(false)}
            content={content}
            initialRetryType={reTryType || ReWriteAI.Complete}
            onRetry={handleRetry}
            onCopy={props.onCopyToWritePage}
          />
        )}
      </>
      <>
        <CustomInstructionDialog
          open={modalCustomInstruction}
          onClose={() => {
            setModalCustomInstruction(false);
          }}
          writeCustomInstruction={writeCustomInstruction}
          onCopy={props.onCopyToWritePage}
          onRetry={handleRetry}
        />
        {/* <FormatPostDialog
          open={modalFormatPost}
          onOpen={() => setModalFormatPost(true)}
          onClose={() => setModalFormatPost(false)}
          onGetValue={handleGetValueFromDialog}
          formatContent={formatContent}
          onCopy={props.onCopyToWritePage}
          onRetry={handleRetry}
        /> */}
        <>
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <Dialog open={isLoading}>
                <DialogContent>
                  <div className="text-center">
                    <svg
                      className="bg-awst text-awst mx-auto mb-3 h-8 w-8 animate-spin"
                      viewBox="0 0 24 24"></svg>
                    <p className="text-default ml-2 text-[16px]">Creating...</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </>
      </>
    </div>
  );
};
