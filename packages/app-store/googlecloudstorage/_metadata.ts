import _package from "./package.json";
import { validJson } from "@quillsocial/lib/jsonUtils";
import type { AppMeta } from "@quillsocial/types/App";

export const metadata = {
  name: "Google Cloud Storage",
  description: _package.description,
  installed: !!(
    process.env.GOOGLE_API_CREDENTIALS &&
    validJson(process.env.GOOGLE_API_CREDENTIALS)
  ),
  type: "google_cloudstorage",
  title: "Google Storage",
  variant: "cloudstorage",
  category: "cloudstorage",
  categories: ["cloudstorage"],
  logo: "icon.svg",
  publisher: "Ha Doan",
  slug: "google-cloudstorage",
  url: "https://quillsocial.com/",
  email: "help@quillsocial.com",
  dirName: "googlecloudstorage",
} as AppMeta;

export default metadata;
