import {
  getChatCompletions,
  getRewriteCompletions,
} from "../getChatCompletions";

const getMessageTexts = (
  idea: string,
  emotionVoice: string,
  format?: string
) => {
  const instruction = format
    ? `complete then transfer the following paragraph into the pre-defined format, use tone ${emotionVoice} of voice, remove opening and closing curly brace, the pre-defined format is:
    ${format}. And the paragraph is: 
    `
    : `complete the following paragraph, use tone ${emotionVoice} of voice, remove opening and closing curly brace, the paragraph is: 
    `;
  return `${instruction}: '${idea}''`;
};

export const generateFromScratch = async (
  userId: number,
  idea: string,
  emotionVoice: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(idea, emotionVoice, format)
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
