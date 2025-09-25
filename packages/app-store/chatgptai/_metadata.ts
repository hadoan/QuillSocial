import _package from "./package.json";
import type { AppMeta } from "@quillsocial/types/App";

export const metadata = {
  name: "ChatGPT AI",
  description: _package.description,
  installed: true,
  type: "chatgpt_ai",
  title: "ChatGPT",
  variant: "ai",
  categories: ["ai"],
  category: "ai",
  logo: "icon.svg",
  publisher: "",
  slug: "chatgpt-ai",
  url: "",
  email: "",
  dirName: "chatgptai",
} as AppMeta;

export default metadata;
