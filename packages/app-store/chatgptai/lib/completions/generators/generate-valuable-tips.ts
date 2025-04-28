import {
  getChatCompletions,
  getRewriteCompletions,
} from "../getChatCompletions";

const getMessageTexts = (topic: string, tips: string, format?: string) => {
  const instruction = format
    ? `write a valuable tips and complete it to share in social networks for the topic "${topic}", the tips i would like to share "${tips}", then transfer the paragraph into the pre-defined format as below:
    ${format}. 
    Remove opening and closing curly brace`
    : `write a valuable tips and complete it to share in social networks for the topic "${topic}", the tips i would like to share "${tips}"`;
  return `${instruction}`;
};

export const generateValuableTips = async (
  userId: number,
  topic: string,
  tips: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(topic, tips, format)
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
