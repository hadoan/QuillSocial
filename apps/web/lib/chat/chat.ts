import { ChatEntity, ChatItem, Notification } from "@lib/types/chatDocProps";

export const CHAT_HISTORY = "CHAT_HISTORY";
export const CHATS_DATA_KEY = "quivr-chats";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";

export const getChats = async (): Promise<ChatEntity[]> => {
  const response = await fetch(`${API_URL}/chat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return data?.chats ?? [];
};

export const getChatItems = async (chatId: string): Promise<ChatItem[]> => {
  const response = await fetch(`${API_URL}/chat/${chatId}/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return data;
};

export const getChatNotifications = async (
  chatId: string
): Promise<Notification[]> => {
  const response = await fetch(`${API_URL}/notifications/${chatId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return data;
};

export const createChat = async (name: string): Promise<ChatEntity> => {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
  return data;
};

export type ChatConfig = {
  model: any;
  temperature: number;
  maxTokens: number;
};

export const deleteChat = async (chatId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/chat/${chatId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};
