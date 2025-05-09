import {
  ChatContextProps,
  ChatMessage,
  Notification,
} from "@lib/types/chatDocProps";
import { createContext, useState } from "react";

export const ChatContext = createContext<ChatContextProps | undefined>(
  undefined
);

export const ChatProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addToHistory = (message: ChatMessage) => {
    setMessages((prevHistory) => [...prevHistory, message]);
  };

  const updateStreamingHistory = (streamedChat: ChatMessage): void => {
    setMessages((prevHistory: ChatMessage[]) => {
      const updatedHistory = prevHistory.find(
        (item) => item.message_id === streamedChat.message_id
      )
        ? prevHistory.map((item: ChatMessage) =>
            item.message_id === streamedChat.message_id
              ? { ...item, assistant: item.assistant + streamedChat.assistant }
              : item
          )
        : [...prevHistory, streamedChat];

      return updatedHistory;
    });
  };

  const updateHistory = (chat: ChatMessage): void => {
    setMessages((prevHistory: ChatMessage[]) => {
      const updatedHistory = prevHistory.find(
        (item) => item.message_id === chat.message_id
      )
        ? prevHistory.map((item: ChatMessage) =>
            item.message_id === chat.message_id
              ? { ...item, assistant: chat.assistant }
              : item
          )
        : [...prevHistory, chat];

      return updatedHistory;
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        addToHistory,
        updateHistory,
        updateStreamingHistory,
        notifications,
        setNotifications,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
