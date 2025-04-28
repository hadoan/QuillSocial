import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Youtube",
  description: _package.description,
  installed: !!(process.env.GOOGLE_API_CREDENTIALS && validJson(process.env.GOOGLE_API_CREDENTIALS)),
  type: "youtube_social",
  title: "Youtube",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "youtube-social",
  url: "https://quillsocial.co/",
  email: "help@quillsocial.co",
  dirName: "youtubesocial",
} as AppMeta;

export default metadata;
