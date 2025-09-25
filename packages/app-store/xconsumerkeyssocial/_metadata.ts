import _package from "./package.json";
import type { AppMeta } from "@quillsocial/types/App";

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
