import { ChatContext } from "./ChatProvider";
import { ChatContextProps } from "@lib/types/chatDocProps";
import { useContext } from "react";

export const useChatContext = (): ChatContextProps => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error("useChatContext must be used inside ChatProvider");
  }

  return context;
};
