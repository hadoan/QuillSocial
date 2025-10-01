import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Threads",
  description: _package.description,
  type: "threads_social",
  title: "Threads",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "threads-social",
  url: "https://quillsocial.com/",
  email: "help@quillsocial.com",
  dirName: "threadssocial",
} as AppMeta;

export default metadata;
