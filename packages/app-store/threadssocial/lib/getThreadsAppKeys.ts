import { z } from "zod";

import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";

const threadsAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uris: z.array(z.string()),
});

export const getThreadsAppKeys = async () => {
  return getParsedAppKeysFromSlug("threads-social", threadsAppKeysSchema);
};
