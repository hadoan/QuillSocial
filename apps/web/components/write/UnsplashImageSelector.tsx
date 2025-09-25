import {
  Dialog,
  DialogContent,
  DialogFooter,
  Button,
  showToast,
} from "@quillsocial/ui";
import NextImage from "next/image";
import React, { useState } from "react";

interface ImageDetail {
  imageUrl: string;
  authorName: string;
  authorLink: string;
}

interface UnsplashImageSelectorProps {
  data: ImageDetail[];
  isOpen: boolean;
  onSelectImage: (imageUrl: string) => void;
  onClose: () => void;
}

const UnsplashImageSelector: React.FC<UnsplashImageSelectorProps> = ({
  data,
  isOpen,
  onSelectImage,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleSave = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      onClose();
    } else {
      showToast("Please select an image", "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[300px] sm:min-w-[750px] lg:min-w-[1000px]">
        <div
          onClick={onClose}
          className="mr-[-23px] ml-auto mt-[-25px] flex h-[40px] w-[40px] items-center justify-center rounded-full border-none bg-white text-center text-red-700 hover:cursor-pointer hover:border-none hover:bg-red-100 focus:border-none"
        >
          X
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 max-h-[500px] overflow-y-auto">
          {Array.isArray(data) &&
            data.length >= 0 &&
            data.map((image, index) => (
              <div
                key={index}
                className={`m-2 flex flex-col items-center justify-center h-[135px] sm:h-[205px]`}
                onClick={() => handleImageClick(image.imageUrl)}
              >
                <NextImage
                  alt={`Image ${index}`}
                  className={`shadow sm:w-[230px] w-[180px] max-h-[130px] sm:max-h-[200px] cursor-pointer border-2 ${
                    image.imageUrl === selectedImage
                      ? "border-awst"
                      : "border-transparent"
                  } hover:opacity-80`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  src={image.imageUrl}
                />

                <div className="flex w-full justify-start items-start">
                  <u
                    className="mr-auto text-sm mt-1 cursor-pointer text-blue-400 hover:text-awst"
                    onClick={() => {
                      if (image.authorLink) {
                        window.open(
                          `https://unsplash.com/@${image.authorLink}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    {image.authorName}
                  </u>
                </div>
              </div>
            ))}
        </div>
        <DialogFooter className="flex justify-end">
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsplashImageSelector;
