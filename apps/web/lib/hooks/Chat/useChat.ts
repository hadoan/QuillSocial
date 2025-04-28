/* eslint-disable max-lines */
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CHATS_DATA_KEY, createChat } from "@lib/chat/chat";
import { ChatConfig, ChatQuestion } from "@lib/types/chatDocProps";

import { useBrainContext } from "./useBrainContext";
import { useChatContext } from "./useChatContext";
import { useQuestion } from "./useQuestion";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useChat = () => {
  const queryClient = useQueryClient();

  const router = useRouter();
  // let chat_id: any = router?.query?.id ?? "";
  const [chatId, setChatId] = useState<string | undefined>(
    router?.query?.id as string | undefined
  );
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const { messages } = useChatContext();
  const { currentBrain, currentPromptId, currentBrainId } = useBrainContext();

  const { addStreamQuestion } = useQuestion();

  const addQuestion = async (question: string, callback?: () => void) => {
    if (question === "") {
      return;
    }

    try {
      setGeneratingAnswer(true);

      let currentChatId: string | undefined = chatId ?? undefined;

      let shouldUpdateUrl = false;

      //if chatId is not set, create a new chat. Chat name is from the first question
      if (currentChatId === undefined) {
        const chat = await createChat(getChatNameFromQuestion(question));
        currentChatId = chat.chat_id;
        setChatId(currentChatId);
        shouldUpdateUrl = true;
        void queryClient.invalidateQueries({
          queryKey: [CHATS_DATA_KEY],
        });
      }

      const chatQuestion: ChatQuestion = {
        question,
      };

      await addStreamQuestion(currentChatId, chatQuestion);

      callback?.();

      if (shouldUpdateUrl) {
        router.replace(`/chatdoc/${currentChatId}`);
      }
    } catch (error) {
      console.error({ error });
    } finally {
      setGeneratingAnswer(false);
    }
  };

  return {
    messages,
    addQuestion,
    generatingAnswer,
    chatId,
  };
};

const getChatNameFromQuestion = (question: string): string =>
  question.split(" ").slice(0, 3).join(" ");

const chatConfigLocalStorageKey = "chat-config";

export const saveChatsConfigInLocalStorage = (chatConfig: ChatConfig): void => {
  localStorage.setItem(chatConfigLocalStorageKey, JSON.stringify(chatConfig));
};

export const getChatsConfigFromLocalStorage = (): ChatConfig | undefined => {
  const config = localStorage.getItem(chatConfigLocalStorageKey);

  if (config === null) {
    return undefined;
  }

  return JSON.parse(config) as ChatConfig;
};
