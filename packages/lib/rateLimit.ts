import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { isIpInBanListString } from "./getIP";
import logger from "./logger";

const log = logger.getChildLogger({ prefix: ["RateLimit"] });

export type RateLimitHelper = {
  rateLimitingType?: "core" | "forcedSlowMode";
  identifier: string;
};

export type RatelimitResponse = {
  /**
   * Whether the request may pass(true) or exceeded the limit(false)
   */
  success: boolean;
  /**
   * Maximum number of requests allowed within a window.
   */
  limit: number;
  /**
   * How many requests the user has left within the current window.
   */
  remaining: number;
  /**
   * Unix timestamp in milliseconds when the limits are reset.
   */
  reset: number;

  pending: Promise<unknown>;
};

export function rateLimiter() {
  const redis = Redis.fromEnv();
  const limiter = {
    core: new Ratelimit({
      redis,
      analytics: true,
      prefix: "ratelimit",
      limiter: Ratelimit.fixedWindow(10, "60s"),
    }),
    forcedSlowMode: new Ratelimit({
      redis,
      analytics: true,
      prefix: "ratelimit:slowmode",
      limiter: Ratelimit.fixedWindow(1, "30s"),
    }),
  };

  async function rateLimit({
    rateLimitingType = "core",
    identifier,
  }: RateLimitHelper) {
    if (isIpInBanListString(identifier)) {
      return await limiter.forcedSlowMode.limit(identifier);
    }

    return await limiter[rateLimitingType].limit(identifier);
  }

  return rateLimit;
}
