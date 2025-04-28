import { Dialog as Delog, Listbox, Menu, Transition } from "@headlessui/react";
import { ArrowUpDown, Pencil, Star } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  Button,
  TextAreaField,
} from "@quillsocial/ui";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  callBackModalAction: (
    isUsed: boolean,
    isEdit: boolean,
    isNew: boolean,
    newItems: { content: string }[]
  ) => void;
  items: { content: string }[];
  setItems: React.Dispatch<React.SetStateAction<{ content: string }[]>>;
  itemsRecomend: { content: string }[];
  setItemsRecomend: React.Dispatch<React.SetStateAction<{ content: string }[]>>;
}
enum ModalAction {
  New = "New",
  Edit = "Edit",
  Use = "Use",
}
enum TabType {
  Recommend = "Recommend",
  All = "All",
  Custom = "Custom",
}
const ModalSelectFormat: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  callBackModalAction,
  items,
  setItems,
  itemsRecomend,
  setItemsRecomend,
}) => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<{ content: string } | null>(
    items.length > 0 && items[0]?.content
      ? { content: items[0]?.content }
      : null
  );
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(TabType.All);
  const [dataRecomandIsNull, setDataRecomandIsNull] = useState(true);
  const [showRecomandData, setShowRecomandData] = useState(false);

  useEffect(() => {
    if (
      itemsRecomend &&
      itemsRecomend.length > 0 &&
      itemsRecomend[0].content !== ""
    ) {
      setDataRecomandIsNull(false);
    } else {
      setDataRecomandIsNull(true);
    }
  }, [itemsRecomend]);

  const dataToRender = showRecomandData ? itemsRecomend : items;
  const handleShuffleClick = () => {
    const listToShuffle = showRecomandData ? itemsRecomend : items;
    if (listToShuffle.length > 1) {
      const copyItems = [...listToShuffle];
      const firstItem = copyItems.shift();
      if (firstItem) {
        copyItems.push(firstItem);
        showRecomandData ? setItemsRecomend(copyItems) : setItems(copyItems);
        setSelectedItem(copyItems[0]);
        setSelectedItemIndex(0);
      }
    }
  };

  const handleActionButton = (action: ModalAction) => {
    switch (action) {
      case ModalAction.New:
        callBackModalAction(true, false, false, []);
        break;
      case ModalAction.Edit:
        callBackModalAction(
          false,
          true,
          false,
          selectedItem ? [selectedItem] : []
        );
        break;
      case ModalAction.Use:
        callBackModalAction(
          false,
          false,
          true,
          selectedItem ? [selectedItem] : []
        );
        break;
      default:
        break;
    }
    onClose();
  };

  const handleItemClick = (index: number) => {
    setSelectedItem(items[index]);
    setSelectedItemIndex(index);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto sm:min-h-[500px] sm:min-w-[1200px]">
        <div>
          <div className="flex w-full justify-end">
            <div
              onClick={() => onClose()}
              className="mr-[-23px] mt-[-25px] flex h-[40px] w-[40px] items-center justify-center rounded-full border-none bg-white text-center text-red-700 hover:cursor-pointer hover:border-none hover:bg-red-100 focus:border-none"
            >
              X
            </div>
          </div>
          <div className="flex items-center  justify-start">
            <div className="text-center text-[20px] font-bold">
              Select format
            </div>
          </div>
          <div className="flex gap-2">
            {!dataRecomandIsNull && (
              <Button
                onClick={() => {
                  setShowRecomandData(true);
                  setActiveTab(TabType.Recommend);
                  setSelectedItem(itemsRecomend[0]);
                }}
                className={`rounded-2xl hover:text-white ${
                  activeTab === TabType.Recommend
                    ? "bg-awst"
                    : "text-dark border bg-white"
                }`}
              >
                <span className="-ml-2 mr-1 flex h-4 w-4 items-center justify-center text-yellow-400">
                  <Star />
                </span>
                Recomand
              </Button>
            )}
            {/* <Button
              onClick={() => {
                setActiveTab(TabType.All);
                setShowRecomandData(false);
                setSelectedItem(items[0]);
              }}
              className={`rounded-2xl hover:text-white ${activeTab === TabType.All ? 'bg-awst' : 'bg-white text-dark border hover:text-white'}`}
            >
              All
            </Button>
            <Button onClick={() => {
              setActiveTab(TabType.Custom)
            }
            } className={`rounded-2xl ${activeTab === TabType.Custom ? 'bg-awst' : 'bg-white text-dark border hover:text-white'}`}>
              Custom
            </Button> */}
          </div>
          {activeTab === TabType.Recommend || activeTab === TabType.All ? (
            <>
              {" "}
              <div className="mt-5 grid min-h-[500px] w-full grid-cols-12 rounded-2xl border">
                <div className="col-span-12 h-[522px] overflow-y-auto border-r sm:col-span-5">
                  <div className="flex flex-col">
                    <div className="flex h-[70px] items-center justify-center border-b py-1">
                      <Button
                        StartIcon={ArrowUpDown}
                        onClick={handleShuffleClick}
                        type="button"
                        className="shadow-xs mt-[1px] inline-flex items-center justify-center  gap-1 rounded-full bg-white py-2 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 transition-all duration-150 hover:bg-gray-50 hover:text-gray-900"
                      >
                        Shuffle Formats
                      </Button>
                    </div>
                    {dataToRender.map((item, index) => (
                      <div
                        key={index}
                        className={`item-center flex h-[80px] flex-col justify-center p-2 ${
                          index === 0 ? "font-semibold" : ""
                        } ${
                          selectedItemIndex === index
                            ? "border-r-4 border-blue-600 bg-teal-50"
                            : ""
                        }`}
                        onClick={() => handleItemClick(index)}
                        style={
                          index === dataToRender.length - 1 &&
                          dataToRender.length > 5
                            ? { borderRadius: "0 0 0 8px" }
                            : { borderBottom: "1px solid #ccc" }
                        }
                      >
                        <div className="my-2 mt-1 text-sm font-bold text-gray-600">
                          {item.content.slice(0, 60)}
                        </div>
                        <div className="my-2 mt-1 truncate text-sm font-normal text-gray-600">
                          {item.content.slice(60)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-12 flex flex-col sm:col-span-7">
                  <div className="overflow-y-auto p-4">
                    {selectedItem ? (
                      <div>
                        <div className="h-[420px] overflow-y-auto p-2 text-sm">
                          {selectedItem.content
                            .split("\n")
                            .map((line, index) => (
                              <React.Fragment key={index}>
                                {line}
                                <br />
                              </React.Fragment>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <p>Select an item to view its content.</p>
                    )}
                  </div>
                  <div className="mt-auto flex h-[70px] border-t">
                    <div className="ml-auto flex items-center justify-center gap-2">
                      {/* <Button
                        onClick={() => {
                          handleActionButton(ModalAction.Edit);
                        }}
                        StartIcon={Pencil}
                        className="text-dark rounded-2xl border bg-white hover:text-white">
                        Edit
                      </Button> */}
                      <Button
                        onClick={() => {
                          handleActionButton(ModalAction.Use);
                        }}
                        className="mr-2 rounded-2xl"
                      >
                        Use Post Format
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5 flex min-h-[500px] w-full items-center  justify-center rounded-2xl border">
              <div className="flex flex-col items-center justify-center">
                <img
                  src="/empty-drafts.svg"
                  className="h-[200px] w-[200px]"
                ></img>
                <span className="font-bold">
                  {" "}
                  There is no custom post formats created!
                </span>
                <span className="text-sm">
                  {" "}
                  Create a new custom post format to make your work fast{" "}
                </span>
                <Button
                  className="mt-5"
                  onClick={() => {
                    handleActionButton(ModalAction.New);
                  }}
                >
                  Create Post Format
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSelectFormat;
