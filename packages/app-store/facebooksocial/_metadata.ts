import { validJson } from "@mysticquill/lib/jsonUtils";
import type { AppMeta } from "@mysticquill/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Facebook",
  description: _package.description,
  type: "facebook_social",
  title: "Facebook",
  variant: "social",
  category: "social",
  categories: ["social"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "facebook-social",
  url: "https://mysticquill.co/",
  email: "help@mysticquill.co",
  dirName: "facebooksocial",
} as AppMeta;

export default metadata;
