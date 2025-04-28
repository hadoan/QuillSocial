import { getChatCompletions, getRewriteCompletions } from "../getChatCompletions";

const getMessageTexts = (
  challenge: string,
  overcome: string,
  feeling: boolean,
  advice: string,
  format?: string
) => {
  const instruction = format
    ? `write a paragraph about a challenge I want to share in social networks, the challenge is "${challenge}", I overcome it by "${overcome}", i was feel "${feeling}", the advice is "${advice}", then convert the paragraph into the pre-defined format as below:
    ${format}.
    Remove opening and closing curly brace`
    : `write a paragraph about a challenge I want to share in social networks, the challenge is "${challenge}", I overcome it by "${overcome}", i was feel "${feeling}", the advice is "${advice}"`;
  return `${instruction}`;
};

export const generateStruggle = async (
  userId: number,
  challenge: string,
  overcome: string,
  feeling: boolean,
  advice: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(challenge, overcome, feeling, advice, format)
  );

  let statusContent: string | undefined = "";

  const tokens = [];
  if (post && post.choices && post.choices.length > 0) {
    statusContent = post?.choices[0]?.message?.content!;
    tokens.push(post.usage);
  }
  return {
    tokens,
    post: statusContent.replace(/['"]/g, ""),
  };
};
