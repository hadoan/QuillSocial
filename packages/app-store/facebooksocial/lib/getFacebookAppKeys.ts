import { z } from "zod";

import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";

const facebookAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uris: z.array(z.string()),
});

export const getFacebookAppKeys = async () => {
  return getParsedAppKeysFromSlug("facebook-social", facebookAppKeysSchema);
};
