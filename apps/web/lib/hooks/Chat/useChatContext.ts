import { useContext } from "react";

import { ChatContextProps } from "@lib/types/chatDocProps";
import { ChatContext } from "./ChatProvider";

export const useChatContext = (): ChatContextProps => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error("useChatContext must be used inside ChatProvider");
  }

  return context;
};
