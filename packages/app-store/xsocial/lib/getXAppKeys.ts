import { z } from "zod";

import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";

const xAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
});

export const getXAppKeys = async () => {
  return getParsedAppKeysFromSlug("x-social", xAppKeysSchema);
};
