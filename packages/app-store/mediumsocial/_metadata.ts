import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Medium",
  description: _package.description,
  type: "medium_social",
  title: "Medium",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "medium-social",
  url: "https://quillsocial.co/",
  email: "help@quillsocial.co",
  dirName: "mediumsocial",
} as AppMeta;

export default metadata;
