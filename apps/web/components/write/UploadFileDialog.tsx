import { Dialog, DialogContent, DialogFooter, Input } from "@quillsocial/ui";
import { Button } from "@quillsocial/ui";
import {
  Smartphone,
  Tablet,
  Laptop,
  Copy,
  Image,
  Upload,
} from "@quillsocial/ui/components/icon";
import { useState } from "react";

interface UploadFileDialogProps {
  open: boolean;
  onClose: () => void;
}

export const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-xl">
        <div className="w-full flex justify-end">
          <div className="mr-auto font-bold">Upload Carousel</div>
          <div
            onClick={onClose}
            className="rounded-full h-[40px] hover:cursor-pointer flex justify-center items-center text-center w-[40px] mr-[-23px] border-none hover:border-none focus:border-none mt-[-25px] hover:bg-red-100 bg-white text-red-700"
          >
            &times;
          </div>
        </div>
        <div className="mt-4">
          <div className="block mb-2">
            <p className="text-gray-700 text-sm font-semibold">
              Carousel Title
            </p>
            <Input
              placeholder="Add a descriptive title to your document"
              className="mt-2"
            />
          </div>
          <span className="block text-gray-700 text-sm font-semibold mb-2">
            Upload a File
          </span>
          <div className="flex flex-col items-center justify-center p-4  border rounded-lg border-gray-300 bg-slate-50">
            <Button className="mb-2 hover:text-white text-dark bg-slate-50">
              <Upload />{" "}
            </Button>
            <span className="block text-awst font-bold  text-xs">
              Click to Upload
            </span>
            <span className="block text-gray-500 text-xs">
              Only PDF files are supported. (The maximum size per file is 200MB)
            </span>
          </div>
        </div>
        <DialogFooter className="flex justify-end">
          <Button className="rounded-xl">Upload Carousel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
