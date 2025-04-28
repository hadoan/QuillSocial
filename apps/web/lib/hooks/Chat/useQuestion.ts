import { useTranslation } from "react-i18next";

import { ChatQuestion } from "@lib/types/chatDocProps";

import { useBrainContext } from "./useBrainContext";
import { useHandleStream } from "./useHanldeStream";

interface UseChatService {
  addStreamQuestion: (
    chatId: string,
    chatQuestion: ChatQuestion
  ) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";

export const useQuestion = (): UseChatService => {
  const { currentBrain } = useBrainContext();

  const { t } = useTranslation(["chat"]);
  const { handleStream } = useHandleStream();

  const handleFetchError = async (response: Response) => {
    if (response.status === 429) {
      // publish({
      //   variant: "danger",
      //   text: t("tooManyRequests", { ns: "chat" }),
      // });

      return;
    }

    const errorMessage = (await response.json()) as { detail: string };
    // publish({
    //   variant: "danger",
    //   text: errorMessage.detail,
    // });

    return;
  };

  const addStreamQuestion = async (
    chatId: string,
    chatQuestion: ChatQuestion
  ): Promise<void> => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    const body = JSON.stringify(chatQuestion);

    try {
      const response = await fetch(
        `${API_URL}/chat/${chatId}/question/stream?brain_id=${
          chatQuestion?.brain_id ?? ""
        }`,
        {
          method: "POST",
          body,
          headers,
        }
      );
      if (!response.ok) {
        void handleFetchError(response);

        return;
      }

      if (response.body === null) {
        throw new Error(t("resposeBodyNull", { ns: "chat" }));
      }

      await handleStream(response.body.getReader());
    } catch (error) {
      console.error("error:", error);
    }
  };

  return {
    addStreamQuestion,
  };
};
