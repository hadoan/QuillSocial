import { getEnvAppKeys } from "../getAppKeys";
import OpenAI from "openai";

export const getChatCompletions = async (
  userId: number,
  prompt: string,
  platform?: string
) => {
  try {
    // Send request to OpenAI API
    // const userMsg =
    const socialMedia = platform ?? "social media";
    const response = await (
      await getOpenAIApi(userId)
    ).chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate a ${socialMedia} status based on the following prompt: ${prompt}`,
        },
      ],

      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "text",
      },
    });

    // Extract the text from the response
    let statusContent: string | undefined = "";

    const tokens: (any | undefined)[] = [];
    if (response && response.choices && response.choices.length > 0) {
      statusContent = response?.choices[0]?.message?.content!;
      tokens.push(response.usage);
    }

    return {
      tokens,
      post: statusContent.replace(/['"]/g, ""),
      chatCompletion: response,
    };
  } catch (error) {
    console.error("Error generating status:", error);
    return {
      tokens: null,
      post: "",
      chatCompletion: null,
    };
  }
};

export const getRewriteCompletions = async (
  userId: number,
  instruction: string
) => {
  try {
    // Send request to OpenAI API
    // const userMsg =
    const response = await (
      await getOpenAIApi(userId)
    ).chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, linkedin, ad copy and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."',
        },
        {
          role: "user",
          content: instruction,
        },
      ],

      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "text",
      },
    });

    // Extract the text from the response
    let statusContent: string | undefined = "";

    const tokens: (any | undefined)[] = [];
    if (response && response.choices && response.choices.length > 0) {
      statusContent = response?.choices[0]?.message?.content!;
      tokens.push(response.usage);
    }

    return {
      tokens,
      post: statusContent.replace(/['"]/g, ""),
      chatCompletion: response,
    };
  } catch (error) {
    console.error("Error generating status:", error);
    return {
      tokens: null,
      post: "",
      chatCompletion: null,
    };
  }
};

const getOpenAIApi = async (userId: number) => {
  const appKeys = getEnvAppKeys();
  console.log("OpenAI API keys:", appKeys);
  const openai = new OpenAI({
    organization: appKeys?.organizationId,
    apiKey: appKeys?.apiKey,
  });
  return openai;
};
