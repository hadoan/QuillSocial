import {
  getChatCompletions,
  getRewriteCompletions,
} from "../getChatCompletions";

const getMessageTexts = (
  recentLearn: string,
  how: string,
  keyLearning: string,
  format?: string
) => {
  const instruction = format
    ? `write a paragraph about recent learning and complete it to share in social networks for the topic "${recentLearn}", the key learnings i would like to share "${keyLearning}", "${how}" is how did I learn it, then convert the paragraph into the pre-defined format as below:
    ${format}.
    Remove opening and closing curly brace`
    : `write a paragraph about recent learning and complete it to share in social networks for the topic "${recentLearn}", the key learnings i would like to share "${keyLearning}", "${how}" is how I learned it.
        `;
  return `${instruction}`;
};

export const generateRecentLearning = async (
  userId: number,
  recentLearn: string,
  how: string,
  keyLearning: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(recentLearn, how, keyLearning, format)
  );

  let statusContent: string | undefined = "";

  const tokens: (any | undefined)[] = [];
  if (post && post.choices && post.choices.length > 0) {
    statusContent = post?.choices[0]?.message?.content!;
    tokens.push(post.usage);
  }
  return {
    tokens,
    post: statusContent.replace(/['"]/g, ""),
  };
};
