
import { ReWriteAI } from "@quillsocial/types/ReWriteAI";

import { getRewriteCompletions } from "./getChatCompletions";

const getMessageTexts = (instruction: string, idea: string): any[] => {
  return [
    {
      role: "system",
      content:
        'You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, linkedin, ad copy and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."',
    },
    {
      role: "user",
      content: `${instruction}: '${idea}''`,
    },
  ];
};

export const completePostStatus = async (userId: number, instruction: any, idea: string) => {
  const instructionText = Object.values(ReWriteAI).includes(instruction)
    ? `${instruction} this paragraph`
    : instruction;
  // const post = await getChatCompletions(getMessageTexts(prompt, idea));
  const post = await getRewriteCompletions(userId, `${instructionText}: '${idea}''`);

  return post;
};

// const getChatCompletions = async (messages: any[]) => {
//   return getChatCompletions(AZURE_OPENAI_DEPLOYMENT_ID, messages, {
//     temperature: 0.7,
//     maxTokens: 800,
//     topP: 0.95,
//     frequencyPenalty: 0,
//     presencePenalty: 0,
//   });
// };
