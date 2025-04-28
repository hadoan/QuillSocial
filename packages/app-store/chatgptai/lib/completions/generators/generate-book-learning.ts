import { getChatCompletions, getRewriteCompletions } from "../getChatCompletions";

const getMessageTexts = (learnings: string, bookName: string, quote: string, format?: string) => {
  const instruction = format
    ? `write a  paragraph to share my learnings from a book name "${bookName}", the quotes in the book resonated with me the most is "${quote}", the key learnings from the book is "${learnings}", then transfer the paragraph into the pre-defined format as below:
    ${format}. 
    Remove opening and closing curly brace`
    : `write a  paragraph to share my learnings from a book name "${bookName}", the quotes in the book resonated with me the most is "${quote}", the key learnings from the book is "${learnings}".`;
  //   return [
  //     {
  //       role: "system",
  //       content:
  //         'You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, linkedin, ad copy and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."',
  //     },
  //     {
  //       role: "user",
  //       content: `${instruction}`,
  //     },
  //   ];
  return instruction;
};

export const generateBookLearning = async (
  userId: number,
  bookName: string,
  learnings: string,
  quote: string,
  format?: string
) => {
  const { chatCompletion: post } = await getRewriteCompletions(
    userId,
    getMessageTexts(learnings, bookName, quote, format)
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
