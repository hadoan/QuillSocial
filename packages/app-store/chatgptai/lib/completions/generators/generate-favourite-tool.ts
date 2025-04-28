import {
  getChatCompletions,
  getRewriteCompletions,
} from "../getChatCompletions";

const getMessageTexts = (tool: string, whyGood: string, format?: string) => {
  const instruction = format
    ? `write a paragraph about a favourite tool and complete it to share in social networks. The tool is "${tool}", the reason why can't I live without this tool is "${whyGood}", then transform the paragraph into the format as below: ${format}.
    Remove opening and closing curly brace`
    : `write a paragraph about a favourite tool and complete it to share in social networks. The tool is "${tool}", the reason why can't I live without this tool is "${whyGood}"`;
  // return [
  //     {
  //         role: "system",
  //         content:
  //             'You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, linkedin, ad copy and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."',
  //     },
  //     {
  //         role: "user",
  //         content: `${instruction}`,
  //     },
  // ];
  return instruction;
};

export const generateFavouriteTool = async (
  userId: number,
  tool: string,
  whyGood: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(tool, whyGood, format)
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
