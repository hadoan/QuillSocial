import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

import _package from "./package.json";

export const metadata = {
  name: "TwitterV1",
  description: _package.description,
  type: "twitterv1_social",
  title: "Twitter V1",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "twitterv1-social",
  url: "https://quillsocial.com/",
  email: "help@quillsocial.com",
  dirName: "twitterv1social",
} as AppMeta;

export default metadata;
