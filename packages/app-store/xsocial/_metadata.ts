import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

import _package from "./package.json";

export const metadata = {
  name: "X",
  description: _package.description,
  type: "x_social",
  title: "X.com",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "x-social",
  url: "https://quillsocial.co/",
  email: "help@quillsocial.co",
  dirName: "xsocial",
} as AppMeta;

export default metadata;
