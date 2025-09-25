import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";
import { z } from "zod";

const xAppKeysSchema = z.object({
  appKey: z.string(),
  appSecret: z.string(),
});

export const getXAppKeys = async () => {
  return getParsedAppKeysFromSlug("twitterv1-social", xAppKeysSchema);
};
