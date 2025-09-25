import { classNames } from "@quillsocial/lib";
import { useState } from "react";

type UseMessageRowProps = {
  speaker: "user" | "assistant";
  text?: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useMessageRow = ({ speaker, text }: UseMessageRowProps) => {
  const isUserSpeaker = speaker === "user";
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (text === undefined) {
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => setIsCopied(true),
      (err) => console.error("Failed to copy!", err)
    );
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  const containerClasses = classNames(
    "py-3 px-5 w-fit",
    isUserSpeaker ? "bg-neutral-200" : "bg-purple-200",
    "dark:bg-gray-800 rounded-xl flex flex-col overflow-hidden scroll-pb-32"
  );

  const containerWrapperClasses = classNames(
    "flex flex-col",
    isUserSpeaker ? "items-end" : "items-start"
  );

  const markdownClasses = classNames("prose", "dark:prose-invert");

  return {
    isUserSpeaker,
    isCopied,
    handleCopy,
    containerClasses,
    containerWrapperClasses,
    markdownClasses,
  };
};
