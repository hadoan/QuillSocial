import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Instagram",
  description: _package.description,
  type: "instagram_social",
  title: "Instagram",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "instagram-social",
  url: "https://mysticquill.co/",
  email: "help@quillsocial.co",
  dirName: "instagramsocial",
} as AppMeta;

export default metadata;
