import { Prompt } from "@lib/types/brains";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";

export const getPublicPrompts = async (): Promise<Prompt[]> => {
  const response = await fetch(`${API_URL}/prompts`, {
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
