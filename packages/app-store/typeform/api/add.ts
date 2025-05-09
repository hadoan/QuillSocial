import type { AppDeclarativeHandler } from "@quillsocial/types/AppHandler";

import { createDefaultInstallation } from "../../_utils/installation";
import appConfig from "../config.json";

const handler: AppDeclarativeHandler = {
  appType: appConfig.type,
  slug: appConfig.slug,
  variant: appConfig.variant,
  supportsMultipleInstalls: false,
  handlerType: "add",
  redirect: {
    url: "/apps/typeform/how-to-use",
  },
  createCredential: ({ appType, user, slug }) =>
    createDefaultInstallation({ appType, user, slug, key: {} }),
};

export default handler;
