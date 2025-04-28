import { getChatCompletions } from "./getChatCompletions";

const getPrompt = (
  idea: string,
  type: string,
  desc: string,
  speakAbout: string
) => {
  const aboutMe =
    desc && speakAbout
      ? `The description for me as: '${desc}' and I am speaking about: '${speakAbout}'.`
      : "";
  const promt = ` ${aboutMe}
  Help me to generate a quality social media post for the idea: '${idea}'. 
  Persuade audience to interact with status, add icons and hashtags with bullet points if possible, just write result only, no explanation and dont write out the tone`;
  return type === "twitter"
    ? promt + ", max 280 charaters"
    : promt + ", min 150 charaters";
};
const getMessageTexts = (
  type: string,
  idea: string,
  desc: string,
  speakAbout: string
): any[] => {
  return [
    {
      role: "system",
      content:
        'You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, linkedin, ad copy and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."',
    },
    {
      role: "user",
      content: getPrompt(idea, type, desc, speakAbout),
    },
  ];
};
const getTopicsMessageTexts = (idea: string): any[] => {
  return [
    {
      role: "system",
      content:
        'You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, ad copy and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."',
    },
    {
      role: "user",
      content: `suggest 3 topics from idea: ${idea}, max 3 words per topic and answer in format \n1. {topic1}\n2. {topic2} \n3. {topic3}`,
    },
  ];
};

export const generateStatus = async (
  userId: number,
  type: string,
  idea: string,
  desc: string,
  speakAbout: string
) => {
  const [status, topics] = await Promise.all([
    getChatCompletions(userId, getPrompt(idea, type, desc, speakAbout)),
    getChatCompletions(
      userId,
      `suggest 3 topics from idea: ${idea}, max 3 words per topic and answer in format \n1. {topic1}\n2. {topic2} \n3. {topic3}`
    ),
  ]);
  let statusContent: string | undefined = "";
  let topicsContent: string | undefined = "";
  const tokens = [];
  if (
    status &&
    status.chatCompletion?.choices &&
    status.chatCompletion?.choices.length > 0
  ) {
    statusContent = status.chatCompletion?.choices[0]?.message?.content!;
    tokens.push(status.chatCompletion.usage);
  }
  if (
    topics &&
    topics.chatCompletion?.choices &&
    topics.chatCompletion?.choices.length > 0
  ) {
    topicsContent = topics?.chatCompletion?.choices[0]?.message?.content!;
    tokens.push(topics.chatCompletion.usage);
  }
  return {
    tokens,
    posts: [statusContent],
    topics: cleanMultipleLineString(topicsContent),
  };
};

const cleanMultipleLineString = (topics: string) => {
  if (!topics) return "";
  // Split the text into lines
  const lines: string[] = topics.split("\n");

  // Extract the text after the number and dot for each line
  const resultArray: string[] = lines
    .filter((line) => /\d+\.\s/.test(line))
    .map((line) => line.split(". ")[1]);
  return resultArray;
};
