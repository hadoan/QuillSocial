import type { AppMeta } from "@quillsocial/types/App";

import _package from "./package.json";

export const metadata = {
  name: "X Consumer Keys Social",
  description: _package.description,
  installed: true,
  type: "xconsumerkeys_social",
  title: "X",
  variant: "social",
  categories: ["social"],
  category: "social",
  logo: "icon.svg",
  publisher: "",
  slug: "xconsumerkeys-social",
  url: "",
  email: "",
  dirName: "xconsumerkeyssocial",
} as AppMeta;

export default metadata;
