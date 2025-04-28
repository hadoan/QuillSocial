import { getChatCompletions, getRewriteCompletions } from "../getChatCompletions";

const getMessageTexts = (url: string, instructions: string, webContent: string, format?: string) => {
  const instruction = format
    ? `Craft a short summary in the format "${format}" which include the article link "${url}" to share the article to my linkedin post based on my instructions "${instructions}", the summary should be short and has icons.
     The article content is: ${webContent}
     `
    : `Craft a short summary which include the article link "${url}" to share the article to my linkedin post based on my instructions "${instructions}", the summary should be short and has icons.
     The article content is: ${webContent}
     `;
  return `${instruction}`;
};

export const generateFromArticle = async (
  userId: number,
  url: string,
  instructions: string,
  webContent: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(url, instructions, webContent, format)
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
