import { GenerateHeadlineAboutResponse } from "../types/GenerateHeadlineAboutResponse";
import { getChatCompletions } from "./getChatCompletions";

const getPrompt = (cv: string) => {
  const promt = ` Create a LinkedIn headline that clearly conveys my experience, qualifications, and unique value. Consider incorporating keywords relevant to my industry as mentioned in the resume below and showcasing my passion or mission. My headline should be a snapshot that captures attention and encourages visitors to explore my profile further.
  Answer in the following format:
  {
    "answer1": {answer1},
    "answer2": {answer2},
    "answer3": {answer3},
    "answer4": {answer4},
    "answer5": {answer5}
  }
  My Resume: 
  ${cv}`;
  return promt;
};

const getMessageTexts = (cv: string): any[] => {
  return [
    {
      role: "system",
      content:
        'You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, linkedin, ad copy and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."',
    },
    {
      role: "user",
      content: getPrompt(cv),
    },
  ];
};

export const generateHeadline = async (userId: number, cv: string) => {
  const { chatCompletion: chatResponse } = await getChatCompletions(
    userId,
    getPrompt(cv)
  );

  if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0) {
    var content = chatResponse?.choices[0]?.message?.content!;
    const response: GenerateHeadlineAboutResponse = JSON.parse(content);
    return response;
  }
  return null;
};
