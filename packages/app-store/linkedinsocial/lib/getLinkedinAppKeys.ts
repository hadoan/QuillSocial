import { z } from "zod";

import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";

const linkedinAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uris: z.array(z.string()),
});

export const getLinkedinAppKeys = async () => {
  return getParsedAppKeysFromSlug("linkedin-social", linkedinAppKeysSchema);
};
