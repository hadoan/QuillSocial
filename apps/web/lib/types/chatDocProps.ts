export interface IFolderList {
  id: string;
  name: string;
  rights: string;
  status: string;
}

export type ChatQuestion = {
  model?: string;
  question?: string;
  temperature?: number;
  max_tokens?: number;
  brain_id?: string;
  prompt_id?: string;
};
export type ChatMessage = {
  chat_id: string;
  message_id: string;
  user_message: string;
  assistant: string;
  message_time: string;
  prompt_title?: string;
  brain_name?: string;
};

type NotificationStatus = "Pending" | "Done";

export type Notification = {
  id: string;
  datetime: string;
  chat_id?: string | null;
  message?: string | null;
  action: string;
  status: NotificationStatus;
};

export type ChatMessageItem = {
  item_type: "MESSAGE";
  body: ChatMessage;
};

export type NotificationItem = {
  item_type: "NOTIFICATION";
  body: Notification;
};

export type ChatItem = ChatMessageItem | NotificationItem;

export type ChatEntity = {
  chat_id: string;
  user_id: string;
  creation_time: string;
  chat_name: string;
};

export type ChatContextProps = {
  messages: ChatMessage[];
  setMessages: (history: ChatMessage[]) => void;
  addToHistory: (message: ChatMessage) => void;
  updateHistory: (chat: ChatMessage) => void;
  updateStreamingHistory: (streamedChat: ChatMessage) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
};

export type ChatConfig = {
  model: any;
  temperature: number;
  maxTokens: number;
};

export type ChatItemWithGroupedNotifications =
  | ChatMessageItem
  | {
      item_type: "NOTIFICATION";
      body: Notification[];
    };
