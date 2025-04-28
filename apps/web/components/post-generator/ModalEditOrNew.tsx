import {
  Dialog,
  DialogContent,
  DialogFooter,
  Button,
  TextAreaField,
} from "@quillsocial/ui";
import { Dialog as Delog, Listbox, Menu, Transition } from "@headlessui/react";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import { Pencil } from "lucide-react";

interface ModalEditOrNewCustomProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  isNew: boolean;
  isEdit: boolean;
  textToShow: string;
  handleReceiveText: (value: string) => void;
  handleIsBack: (value: boolean) => void;
}

const ModalEditOrNewCustom: React.FC<ModalEditOrNewCustomProps> = ({
  open,
  onOpenChange,
  isNew,
  isEdit,
  textToShow,
  handleReceiveText,
  handleIsBack,
}) => {
  const [textContent, setTextContent] = useState(textToShow);
  const [initialTextContent, setInitialTextContent] = useState(textToShow);

  const handleCloseModal = () => {
    setTextContent(``);
    onOpenChange(false);
  };
  useEffect(() => {
    setTextContent(textToShow);
    setInitialTextContent(textToShow);
  }, [textToShow]);

  const handleSave = () => {
    handleReceiveText(textContent);
    onOpenChange(false);
  };
  const isButtonDisabled =
    textContent === "" || textContent === initialTextContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div>
          <div className="w-full flex">
            <div
              onClick={() => {
                onOpenChange(false);
                handleIsBack(true);
              }}
              className=" mr-auto hover:cursor-pointer flex justify-center items-center text-center  border-none hover:border-none focus:border-none mt-[-25px] hover:font-bold text-sm bg-white"
            >
              {" "}
              {`< Back`}
            </div>
            <div
              onClick={() => {
                onOpenChange(false);
              }}
              className="rounded-full ml-auto h-[40px] hover:cursor-pointer flex justify-center items-center text-center w-[40px] mr-[-23px] border-none hover:border-none focus:border-none mt-[-25px] hover:bg-red-100 bg-white text-red-700"
            >
              X
            </div>
          </div>
          <div className="flex justify-start">
            <div className="text-center text-[20px] font-bold">
              {isNew ? "Custom Post Format" : "Edit Post Format"}
            </div>
          </div>
          <TextAreaField
            id="content"
            name="content"
            rows={18}
            placeholder="Describe what you want to write..."
            label=""
            className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
            defaultValue={textToShow}
            onChange={(e) => {
              setTextContent(e.target.value);
            }}
          />
        </div>
        <DialogFooter className=" mt-6 flex items-center justify-end">
          {isNew && (
            <Button
              className=" hover:bg-awstbgbt border bg-white hover:text-awst text-dark"
              onClick={handleCloseModal}
            >
              Discard
            </Button>
          )}
          <Button
            className=" hover:bg-awstbgbt  bg-awst hover:text-awst text-white"
            onClick={handleSave}
            disabled={isButtonDisabled}
          >
            {isNew ? "Save" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditOrNewCustom;
