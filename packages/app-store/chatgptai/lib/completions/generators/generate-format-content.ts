import {
  getChatCompletions,
  getRewriteCompletions,
} from "../getChatCompletions";

const getMessageTexts = (idea: string, format?: string) => {
  const instruction = format
    ? `complete the content "${idea}" to a better format so that I can share it to my audience in social networks, then convert the paragraph into the pre-defined format as below:
    ${format}.
    Remove opening and closing curly brace`
    : `complete and format the content "${idea}" to a better format so that I can share it to my audience in social networks`;
  return `${instruction}: '${idea}''`;
};

export const generateFormatContent = async (
  userId: number,
  idea: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(idea, format)
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
