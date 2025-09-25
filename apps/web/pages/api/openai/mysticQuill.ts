import { getIdFromCode } from "@components/post-generator/constTemplateWrapper";
import { generateBookLearning } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-book-learning";
import { generateFavouriteTool } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-favourite-tool";
import { generateFormatContent } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-format-content";
import { generateFromArticle } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-from-article";
import { generateFromScratch } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-from-scratch";
import { generateRecentLearning } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-recent-learning";
import { generateStruggle } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-struggle";
import { generateValuableTips } from "@quillsocial/app-store/chatgptai/lib/completions/generators/generate-valuable-tips";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import * as cheerio from "cheerio";
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

interface RequestInput {
  code: string;
  format?: string;
  inputs: {
    countInput: number;
    input: { id: string; value: string }[];
  };
}
interface Generators {
  [key: number]: (...args: any[]) => Promise<any>;
}

const generators: Generators = {
  1: generateFromScratch,
  2: generateFromArticle,
  3: generateBookLearning,
  4: generateValuableTips,
  5: generateRecentLearning,
  6: generateFavouriteTool,
  7: generateStruggle,
  8: generateFormatContent,
};

async function handler(
  req: NextApiRequest & { userId?: number },
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
  const session = await getServerSession({ req, res });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const { code, format, inputs } = req.body as RequestInput;
  const numId = getIdFromCode(code);

  const isValidInputs = inputs.input.every(
    (item) => item.value !== null && item.value !== ""
  );

  if (!isValidInputs) {
    res.status(400).json({ message: "Invalid inputs" });
    return;
  }

  if (!numId) {
    res.status(400).json({ message: "Invalid code" });
    return;
  }

  if (code === "from-article") {
    const url = inputs.input.find((x) => x.id === "url")?.value;
    const instructions = inputs.input.find(
      (x) => x.id === "instructions"
    )?.value;
    if (!url || !isValidUrl(url)) {
      res.status(400).json({ message: "Invalid url" });
      return;
    }
    const webContent = await fetchTextContent(url!);
    const content = await generateFromArticle(
      session?.user?.id!,
      url,
      instructions ?? "",
      webContent,
      format ? format : undefined
    );
    return content;
  } else {
    const generatorFunc = generators[numId];
    if (generatorFunc) {
      const valuesInput = inputs.input.map((input) => input.value || null);
      const content = await generatorFunc(
        session?.user?.id!,
        ...valuesInput,
        format ? format : undefined
      );
      return content;
    } else {
      console.error("Invalid code");
      return null;
    }
  }
}

async function fetchTextContent(url: string): Promise<string> {
  // Fetch the HTML content from the URL
  const response = await fetch(url);
  const html = await response.text();

  // Load the HTML into cheerio
  const $ = cheerio.load(html);

  // Extract and return the raw text, removing all HTML tags
  return $("body").text();
}

function isValidUrl(urlString: string): boolean {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name and extension
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!urlPattern.test(urlString);
}

export default defaultResponder(handler);
