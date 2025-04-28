import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { useState } from "react";

import { ReWriteAI } from "@quillsocial/types/ReWriteAI";

import ModalEditOrNewCustom from "@components/post-generator/ModalEditOrNew";
import ModalSelectFormat from "@components/post-generator/ModalSelectFormat";
import { fetchAllFormat, fetchFormatRecomand } from "@components/post-generator/selectFormat";
import { WriteAiDialog } from "@components/write/WriteAiDialog";

interface FormatPostDialog {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onGetValue: (content: string) => void;
  formatContent: (instruction: string) => Promise<string>;
  onRetry: (type: ReWriteAI | string) => void;
  onCopy: (text: string) => void;
}

export const FormatPostDialog: React.FC<FormatPostDialog> = ({
  open,
  onClose,
  onOpen,
  onGetValue,
  onCopy,
  formatContent,
  onRetry,
}) => {
  const [items, setItems] = useState(fetchAllFormat());
  const [itemsRecomend, setItemsRecomend] = useState(fetchFormatRecomand(1));
  const [isModalNewOrEditOpen, setIsModalNewOrEditOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [content, setContent] = useState(``);
  const [selectFormat, setSelectFormat] = useState(``);
  const [modalWriteAi, setModalWriteAi] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [rewriteContent, setRewriteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSettitleModal = async (title: string) => {
    setIsLoading(true);
    const intruction = `complete then transfer the following paragraph  into the pre-defined format, remove opening and closing curly brace, the pre-defined format is:
        ${selectFormat}.
        And the paragraph is: 
        
        `;
    setCustomInstruction(intruction);
    const rewritePost = await formatContent(intruction);
    setIsLoading(false);
    setRewriteContent(rewritePost);
    setTitleModal(title);
    setModalWriteAi(true);
  };
  const handleModalActionReceive = async (
    isNew: boolean,
    isEdit: boolean,
    isUse: boolean,
    newItems: { content: string }[]
  ) => {
    if (isNew || isEdit) {
      setIsModalNewOrEditOpen(true);
    } else {
      //  onGetValue(newItems[0]?.content);
      setSelectFormat(newItems[0]?.content);
      await handleSettitleModal("Format Post");
    }
    setIsEdit(isEdit);
    setIsNew(isNew);
  };

  const handleReceiveFormatFromNewOrEdit = async (value: string) => {
    setSelectFormat(value);
    await handleSettitleModal("Format Post");
    //onGetValue(value);
  };

  const handleRetry = async (type: ReWriteAI | string) => {
    setModalWriteAi(false); 
    setIsLoading(true);
    const rewritePost = await formatContent(type);
    setIsLoading(false);
    setRewriteContent(rewritePost); 
    setModalWriteAi(true); 
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 z-500 flex items-center justify-center bg-black bg-opacity-50">
          <Dialog open={isLoading}>
            <DialogContent>
              <div className="text-center">
                <svg
                  className="bg-awst text-awst mx-auto mb-3 h-8 w-8 animate-spin"
                  viewBox="0 0 24 24"></svg>
                <p className="text-default ml-2 text-[16px]">Loading...</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <ModalSelectFormat
        isOpen={open}
        onClose={() => onClose()}
        callBackModalAction={handleModalActionReceive}
        items={items}
        setItems={setItems}
        itemsRecomend={itemsRecomend}
        setItemsRecomend={setItemsRecomend}
      />
      <ModalEditOrNewCustom
        open={isModalNewOrEditOpen}
        onOpenChange={setIsModalNewOrEditOpen}
        textToShow={content}
        handleReceiveText={handleReceiveFormatFromNewOrEdit}
        handleIsBack={() => {
          onOpen();
        }}
        isNew={isNew}
        isEdit={isEdit}
      />
      {modalWriteAi && (
        <WriteAiDialog
          actionTitle={titleModal}
          content={rewriteContent}
          open={modalWriteAi}
          onClose={() => setModalWriteAi(false)}
          initialRetryType={customInstruction}
          onCopy={onCopy}
          onRetry={handleRetry}
          isKeepDialogOnCopy={true}
        />
      )}
    </>
  );
};
