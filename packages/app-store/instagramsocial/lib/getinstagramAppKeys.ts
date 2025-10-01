import { z } from "zod";

import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";

// Facebook app keys schema for Instagram Business API
// Instagram Business API requires Facebook app credentials
const instagramAppKeysSchema = z.object({
  app_id: z.string(), // Facebook App ID (was client_id)
  app_secret: z.string(), // Facebook App Secret (was client_secret)
  redirect_uris: z.array(z.string()),
});

// Legacy support for existing configuration
const legacyInstagramAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uris: z.array(z.string()),
});

export const getInstagramAppKeys = async () => {
  try {
    // Try new Facebook app keys format first
    return await getParsedAppKeysFromSlug("instagram-social", instagramAppKeysSchema);
  } catch (error) {
    // Fallback to legacy format and transform to new format
    const legacyKeys = await getParsedAppKeysFromSlug("instagram-social", legacyInstagramAppKeysSchema);
    return {
      app_id: legacyKeys.client_id,
      app_secret: legacyKeys.client_secret,
      redirect_uris: legacyKeys.redirect_uris,
    };
  }
};
