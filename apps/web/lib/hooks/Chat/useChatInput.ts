import { useState } from "react";

import { useChat } from "./useChat";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useChatInput = () => {
  const [message, setMessage] = useState<string>("");
  const { addQuestion, generatingAnswer, chatId } = useChat();

  const submitQuestion = (messageChat: string) => {
    if (!generatingAnswer) {
      void addQuestion(messageChat, () => {
        return setMessage("");
      });
    }
  };

  return {
    message,
    setMessage,
    submitQuestion,
    generatingAnswer,
    chatId,
  };
};
