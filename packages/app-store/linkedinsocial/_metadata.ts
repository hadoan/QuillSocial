import _package from "./package.json";
import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

export const metadata = {
  name: "Linkedin",
  description: _package.description,
  type: "linkedin_social",
  title: "Linkedin",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "linkedin-social",
  url: "https://quillsocial.com/",
  email: "help@quillsocial.com",
  dirName: "linkedinsocial",
} as AppMeta;

export default metadata;
