import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useChatContext } from "./useChatContext";
import { getChatItems, getChatNotifications } from "@lib/chat/chat";
import { ChatMessage, ChatItem, Notification } from "@lib/types/chatDocProps";
import { useRouter } from "next/router";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useChatNotificationsSync = () => {
  const { setMessages, setNotifications, notifications, setIsLoading } =
    useChatContext();
  // const { setShouldDisplayFeedCard } = useKnowledgeToFeedContext();
  const router = useRouter();

  const chatId = router?.query?.id as string | undefined;

  const chatNotificationsQueryKey = `notifications-${chatId}`;
  const { data: fetchedNotifications = [] } = useQuery({
    queryKey: [chatNotificationsQueryKey],
    enabled: notifications.length > 0,
    queryFn: () => {
      if (chatId === undefined) {
        return [];
      }

      return getChatNotifications(chatId);
    },
    refetchInterval: () => {
      if (notifications.length === 0) {
        return false;
      }
      const hasAPendingNotification = notifications.find(
        (item) => item.status === "Pending"
      );

      if (hasAPendingNotification) {
        return 2_000; // in ms
      }

      return false;
    },
  });

  useEffect(() => {
    if (fetchedNotifications.length === 0) {
      return;
    }
    setNotifications(fetchedNotifications);
  }, [fetchedNotifications]);

  useEffect(() => {
    // setShouldDisplayFeedCard(false);
    const fetchHistory = async () => {
      setIsLoading(true);
      if (chatId === undefined) {
        setMessages([]);
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      const chatItems = await getChatItems(chatId);

      setMessages(getMessagesFromChatItems(chatItems));
      setNotifications(getNotificationsFromChatItems(chatItems));
      setIsLoading(false);
    };
    void fetchHistory();
  }, [chatId]);
};

const getMessagesFromChatItems = (chatItems: ChatItem[]): ChatMessage[] => {
  const messages = chatItems
    .filter((item) => item.item_type === "MESSAGE")
    .map((item) => item.body as ChatMessage);

  return messages;
};
const getNotificationsFromChatItems = (
  chatItems: ChatItem[]
): Notification[] => {
  const messages = chatItems
    .filter((item) => item.item_type === "NOTIFICATION")
    .map((item) => item.body as Notification);

  return messages;
};
