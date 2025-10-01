import { getXConsumerKeysClient } from "./getClient";
// you already import axios above; if not, keep this
import logger from "@quillsocial/lib/logger";
import prisma from "@quillsocial/prisma";
// Add this below your imports (reuse existing imports)
import axios from "axios";

// Simple sleep helper
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));/**
 * Analyze and classify different types of 403 errors from Twitter API.
 * Returns a structured error response with specific guidance.
 *
 * @param error - Error object from Twitter API
 * @returns Classification with type, message, detail, and solution
 */
export function classifyTwitter403Error(error: any): {
  type: 'duplicate' | 'permissions' | 'auth_scope' | 'length' | 'generic';
  message: string;
  detail: string;
  solution: string;
} {
  // Extract error details from various possible locations
  const errorDetail =
    error.data?.detail ||
    error.data?.title ||
    error?.response?.data?.detail ||
    error?.response?.data?.title ||
    error?.response?.data?.errors?.[0]?.message ||
    error.message ||
    "";

  const errorCode = error?.response?.data?.errors?.[0]?.code || error.code;

  // Log the raw error for debugging
  const log = logger.getChildLogger({ prefix: ["[xconsumerkeys/twitterManager/errorClassifier]"] });
  log.info("Analyzing 403 error", {
    errorDetail,
    errorCode,
    rawError: serializeError(error)
  });

  // Check for duplicate content (most specific)
  if (
    errorDetail.includes("duplicate content") ||
    errorDetail.includes("Status is a duplicate") ||
    errorCode === 187 // v1.1 duplicate status code
  ) {
    return {
      type: 'duplicate',
      message: '🔄 Duplicate Content Detected',
      detail: errorDetail,
      solution: 'This tweet appears to be identical to a recent post. Consider modifying the content or adding a timestamp/ID to make it unique.'
    };
  }

  // Check for app permissions issues
  if (errorDetail.includes("oauth1 app permissions")) {
    return {
      type: 'permissions',
      message: '🔑 App Permissions Error',
      detail: errorDetail,
      solution: 'Your Twitter app only has read permissions. Go to Twitter Developer Portal → App Settings → Set up → App permissions → Change to "Read and write" permissions, then regenerate your access tokens.'
    };
  }

  // Check for access token issues (most common case)
  if (
    errorDetail.includes("You are not permitted to perform this action") ||
    errorDetail.includes("not authorized") ||
    errorDetail.includes("not permitted") ||
    (!errorDetail && error.code === 403)
  ) {
    return {
      type: 'auth_scope',
      message: '❌ Access Token Issue',
      detail: errorDetail || 'You are not permitted to perform this action',
      solution: 'Your access tokens were likely generated before changing app permissions to read-write. Go to Twitter Developer Portal → Your App → Keys and tokens → Regenerate Access Token & Secret → Update your QuillSocial credentials with the NEW tokens.'
    };
  }

  // Check for length/content restrictions (often vague "Forbidden")
  if (
    errorDetail.includes("Forbidden") &&
    !errorDetail.includes("duplicate") &&
    !errorDetail.includes("permitted")
  ) {
    return {
      type: 'length',
      message: '📝 Content Restriction',
      detail: errorDetail,
      solution: 'This may be a content length issue or posting restriction. Try shortening your tweet or check if your account has posting limitations.'
    };
  }

  // Generic 403 fallback
  return {
    type: 'generic',
    message: '🚫 Access Denied (403)',
    detail: errorDetail || 'Unknown 403 error',
    solution: 'Please check your Twitter app permissions, regenerate access tokens, and ensure your account has posting privileges.'
  };
}

/**
 * Retry a function that may throw HTTP errors (from twitter-api-v2).
 * On 429 responses, it will respect `Retry-After` (seconds) or `x-rate-limit-reset` headers when available.
 * Falls back to exponential backoff with jitter.

/**
 * Retry a function that may throw HTTP errors (from twitter-api-v2).
 * On 429 responses, it will respect `Retry-After` (seconds) or `x-rate-limit-reset` headers when available.
 * Falls back to exponential backoff with jitter.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const retries = opts.retries ?? 4;
  const base = opts.baseDelayMs ?? 500; // 500ms

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      // Determine if it's a 429 / rate-limit error
      const status = err?.response?.status ?? err?.code;
      const is429 = status === 429 || String(status) === "429" || err?.code === 429;

      // If not rate-limited, rethrow immediately
      if (!is429) throw err;

      // If this was the last attempt, rethrow
      if (attempt === retries) throw err;

      // Try to get Retry-After (seconds) header
      const headers = err?.response?.headers || {};
      let waitMs: number | undefined;

      const retryAfter = headers["retry-after"] || headers["Retry-After"];
      if (retryAfter) {
        const seconds = Number(retryAfter);
        if (!Number.isNaN(seconds) && seconds >= 0) waitMs = Math.ceil(seconds * 1000);
      }

      // Twitter sometimes provides x-rate-limit-reset as unix epoch seconds
      const reset = headers["x-rate-limit-reset"] || headers["X-Rate-Limit-Reset"];
      if (!waitMs && reset) {
        const epoch = Number(reset);
        if (!Number.isNaN(epoch) && epoch > 0) {
          const now = Math.floor(Date.now() / 1000);
          const secs = Math.max(0, epoch - now) + 1;
          waitMs = secs * 1000;
        }
      }

      // fallback exponential backoff with jitter
      if (!waitMs) {
        const exp = Math.pow(2, attempt) * base;
        const jitter = Math.floor(Math.random() * base);
        waitMs = exp + jitter;
      }

      const log = logger.getChildLogger({ prefix: ["[xconsumerkeys/twitterManager/retry]"] });
      log.warn(`Rate limited (429). Retrying attempt=${attempt + 1}/${retries} after ${waitMs}ms`, {
        attempt,
        retries,
        waitMs,
        error: serializeError(err),
      });

      await sleep(waitMs);
      // continue loop to retry
    }
  }

  // unreachable
  throw new Error("retryWithBackoff: exhausted retries");
}

// Helper to safely serialize Error-like objects for structured logging
function serializeError(err: any) {
  if (!err) return undefined;
  try {
    const safe: any = {
      message: err.message || err.msg || undefined,
      name: err.name,
      stack: err.stack,
      code: err.code || err.status || undefined,
    };

    // Include HTTP response details if present, but avoid deep/circular structures
    if (err.response) {
      safe.response = {
        status: err.response.status,
        // try to stringify response data safely
        data:
          typeof err.response.data === "string"
            ? err.response.data
            : (() => {
                try {
                  return JSON.stringify(err.response.data);
                } catch (e) {
                  return "[unserializable response data]";
                }
              })(),
      };
    }

    // Attach any other useful shallow properties
    if (err.data && typeof err.data !== "object") safe.data = err.data;
    return safe;
  } catch (e) {
    return { message: "[error serializing error]" };
  }
}

/**
 * Search X Community ID by name (keyword).
 * Tries OAuth2 Bearer (v2). If no bearerToken in credentials, auto-mints one
 * from consumer key/secret via oauth2/token (client_credentials) and uses it.
 */
export async function searchXCommunityIdByName(
  credentialId: number,
  name: string
): Promise<{ id?: string; name?: string; error?: string; raw?: any }> {
  try {
    if (!name || !name.trim()) {
      return { error: "Community name (query) is required." };
    }

    const { client, credentials } = await getXConsumerKeysClient(credentialId);
    if (!client || !credentials) {
      return { error: "Could not create X client with provided credentials." };
    }

    // Use retry wrapper to handle rate limits (429) more gracefully.
    const communities = await retryWithBackoff(() => client.searchCommunities(name), {
      retries: 4,
      baseDelayMs: 500,
    });

    // Try to handle multiple possible response shapes from the client.
    // Common shapes:
    // - { data: [ { id, name, ... }, ... ] }
    // - [ { id, name, ... }, ... ]
    // - { communities: [ ... ] }
    // - single object
    const pickFirst = (obj: any) => {
      if (!obj) return null;
      if (Array.isArray(obj) && obj.length > 0) return obj[0];
      if (obj.data && Array.isArray(obj.data) && obj.data.length > 0)
        return obj.data[0];
      if (
        obj.communities &&
        Array.isArray(obj.communities) &&
        obj.communities.length > 0
      )
        return obj.communities[0];
      if (obj.result) return obj.result;
      // fallback: if it's an object with id/name
      if (obj.id || obj.name || obj.title) return obj;
      return null;
    };

    const first = pickFirst(communities);
    if (!first) {
      return {
        raw: communities,
        error: "No communities found for that query.",
      };
    }

    const id =
      first.id || first.community_id || first.communityId || first.id_str;
    const nameResult =
      first.name ||
      first.title ||
      first.community_name ||
      first.username ||
      first.handle;

    return {
      id: id ? String(id) : undefined,
      name: nameResult ? String(nameResult) : undefined,
      raw: communities,
    };
  } catch (err: any) {
    const status = err?.response?.status;
    const detail =
      err?.response?.data?.detail ||
      err?.response?.data?.title ||
      err?.message ||
      "Unknown error";
    const log = logger.getChildLogger({
      prefix: ["[xconsumerkeys/twitterManager/search]"],
    });
    log.error("Failed to search community", {
      status,
      detail,
      error: serializeError(err),
    });
    return {
      error: `Failed to search community: ${status || ""} ${detail}`.trim(),
      raw: err?.response?.data,
    };
  }
}

export const post = async (
  postId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const twitterPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        credential: true,
      },
    });

    const log = logger.getChildLogger({
      prefix: ["[xconsumerkeys/twitterManager/post]"],
    });
    if (!twitterPost || !twitterPost.credentialId) {
      log.error("Post not found or no credential ID", { postId });
      return { success: false, error: "Post not found or no credential ID" };
    }

    // Check if this is an xconsumerkeys-social credential
    if (twitterPost.credential?.appId !== "xconsumerkeys-social") {
      log.error("This post is not associated with xconsumerkeys-social", {
        credentialAppId: twitterPost.credential?.appId,
      });
      return {
        success: false,
        error: "This post is not associated with xconsumerkeys-social",
      };
    }

    const { client, credentials } = await getXConsumerKeysClient(
      twitterPost.credentialId
    );
    if (!client || !credentials) {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "ERROR" },
      });
      log.error("Could not create Twitter client with consumer keys");
      return {
        success: false,
        error: "Could not create Twitter client with consumer keys",
      };
    }

    // Check if we have user access tokens for posting (now mandatory)
    if (
      !credentials.accessToken ||
      !credentials.accessSecret ||
      credentials.accessToken.trim() === "" ||
      credentials.accessSecret.trim() === ""
    ) {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "ERROR" },
      });
      return {
        success: false,
        error:
          "Access tokens are required for posting. Please provide both access token and access token secret in your X Consumer Keys integration settings.",
      };
    }

    // Post directly using the consumer keys + user access tokens
    try {
      const tweetText = twitterPost.content;

      if (!tweetText) {
        await prisma.post.update({
          where: { id: twitterPost.id },
          data: { status: "ERROR" },
        });
        log.error("No content to post", { postId: twitterPost.id });
        return { success: false, error: "No content to post" };
      }

      // Post the tweet
      log.info(
        "Attempting to post tweet with access tokens. If you get a 403 error after this, your access tokens were generated BEFORE changing app permissions to read-write."
      );

      // Check if there's a community to post to
      let tweet;
      if (twitterPost.xcommunity && twitterPost.xcommunity.trim() !== "") {
        log.info("Posting to community", { communityId: twitterPost.xcommunity });
        // Post to community with retry logic
        tweet = await retryWithBackoff(
          () => client.tweet(tweetText, {
            community_id: twitterPost.xcommunity!
          }),
          { retries: 3, baseDelayMs: 1000 }
        );
        log.info("Tweet posted successfully to community", {
          communityId: twitterPost.xcommunity
        });
      } else {
        // Post regular tweet with retry logic
        tweet = await retryWithBackoff(
          () => client.tweet(tweetText),
          { retries: 3, baseDelayMs: 1000 }
        );
        log.info("Tweet posted successfully (no community)");
      }

      await prisma.post.update({
        where: { id: twitterPost.id },
        data: {
          status: "POSTED",
          postedDate: new Date(),
        },
      });

      const communityInfo = twitterPost.xcommunity
        ? ` to community ${twitterPost.xcommunity}`
        : "";
      log.info(`Tweet posted successfully with consumer keys and access tokens${communityInfo}`);
      return { success: true };
    } catch (error: any) {
      // Save full error response to database
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: {
          status: "ERROR",
          result: {
            error: true,
            errorCode: error.code,
            errorStatus: error?.response?.status,
            errorMessage: error.message,
            errorData: error.data,
            responseData: error?.response?.data,
            timestamp: new Date().toISOString(),
          } as any,
        },
      });

      // Log complete error response from Twitter
      log.error("Error posting tweet - Full error details", {
        error: serializeError(error),
        errorCode: error.code,
        errorStatus: error?.response?.status,
        errorData: error.data,
        responseData: error?.response?.data,
        responseHeaders: error?.response?.headers,
        errorMessage: error.message,
        errorStack: error.stack,
      });

      // Check if it's a 403 error and classify it
      if (error.code === 403 || error?.response?.status === 403) {
        // Enhanced error detail extraction for better debugging
        const errorDetail =
          error.data?.detail ||
          error.data?.title ||
          error.data?.message ||
          error?.response?.data?.detail ||
          error?.response?.data?.title ||
          error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.[0]?.detail ||
          error.message ||
          "Unknown 403 error";

        // Log the raw 403 error for debugging
        log.error("Raw 403 error details for debugging", {
          errorCode: error.code,
          responseStatus: error?.response?.status,
          errorData: error.data,
          responseData: error?.response?.data,
          errorMessage: error.message,
          extractedDetail: errorDetail
        });

        const errorClassification = classifyTwitter403Error(error);

        log.error("403 Error Classification", {
          type: errorClassification.type,
          message: errorClassification.message,
          detail: errorClassification.detail,
          solution: errorClassification.solution
        });

        return {
          success: false,
          error: `${errorClassification.message}: ${errorClassification.solution}`
        };
      } else {
        // Log non-403 errors with full response details
        log.error("Non-403 error posting tweet", {
          errorCode: error.code,
          errorStatus: error?.response?.status,
          errorData: error.data,
          responseData: error?.response?.data,
          responseHeaders: error?.response?.headers,
          errorMessage: error.message,
          fullError: serializeError(error),
        });

        return {
          success: false,
          error: `Failed to post tweet: ${error.message || "Unknown error"}`,
        };
      }
    }
  } catch (error: any) {
    const log = logger.getChildLogger({ prefix: ["[xconsumerkeys/twitterManager/post]"] });

    // Log outer catch block errors with full details
    log.error("Unexpected error posting with consumer keys - Full details:", {
      error: serializeError(error),
      errorCode: error?.code,
      errorStatus: error?.response?.status,
      errorData: error?.data,
      responseData: error?.response?.data,
      responseHeaders: error?.response?.headers,
      errorMessage: error?.message,
      errorStack: error?.stack,
    });

    // Save full error to database
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "ERROR",
        result: {
          error: true,
          unexpected: true,
          errorCode: error?.code,
          errorStatus: error?.response?.status,
          errorMessage: error?.message,
          errorData: error?.data,
          responseData: error?.response?.data,
          timestamp: new Date().toISOString(),
        } as any,
      },
    });
    return {
      success: false,
      error: `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};
