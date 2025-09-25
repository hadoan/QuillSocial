import { getCurrentSocialProfile } from "@quillsocial/features/users/lib/getCurrentSocialProfile";
import { LRUCache } from "lru-cache";
import { SocialProfile } from "next-auth";

const PROFILE_CACHE = new LRUCache<string, SocialProfile>({ max: 1000 });

export const getCachedSocialProfile = async (userId: number) => {
  let profile = PROFILE_CACHE.get(userId.toString());
  if (!profile) {
    profile = await getCurrentSocialProfile(userId);
    PROFILE_CACHE.set(userId.toString(), profile);
  }
  return profile;
};

export const resetCachedSocialProfile = async (userId: number) => {
  PROFILE_CACHE.set(userId.toString(), undefined);
  await getCachedSocialProfile(userId);
};
