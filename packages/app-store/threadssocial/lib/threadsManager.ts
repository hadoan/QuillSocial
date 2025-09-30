import { symmetricDecrypt } from "@quillsocial/lib/crypto";
import prisma from "@quillsocial/prisma";
import axios from "axios";

const GRAPH = "https://graph.threads.net/v1.0";

// tiny helper: POST form-encoded to Graph
const postForm = async (url: string, body: Record<string, string>) => {
  const form = new URLSearchParams(body);
  return axios.post(url, form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

export const post = async (postId: number) => {
  console.debug("[threadsManager] post() start", { postId });
  const postRec = await prisma.post.findUnique({ where: { id: postId } });
  console.debug("[threadsManager] fetched post", { postId, found: !!postRec });
  if (!postRec || !postRec.credentialId) {
    console.trace(
      "[threadsManager] aborting post(): missing post or credentialId",
      {
        postId,
        postPresent: !!postRec,
        credentialId: postRec?.credentialId,
      }
    );
    return false;
  }

  const credential = await prisma.credential.findUnique({
    where: { id: postRec.credentialId },
  });
  console.debug("[threadsManager] fetched credential", {
    credentialId: postRec.credentialId,
    credential: credential,
  });
  if (!credential) {
    console.error("Error posting threads status: credential is null", {
      postId,
      credentialId: postRec.credentialId,
    });
    return false;
  }

  // Parse the credential key to get access token and user ID
  let accessToken: string | undefined;
  let userId: string | undefined;
  try {
    let rawKey: any = credential.key as any;

    try {
      rawKey = JSON.parse(rawKey);
    } catch {
      try {
        accessToken = rawKey.access_token;
        userId = rawKey.user_id || undefined;
      } catch (e) {
        console.error("Error parsing Threads credential key", e, {
          credentialId: credential.id,
        });
      }
    }

    console.debug("[threadsManager] credential parsing result", {
      credentialId: credential.id,
      accessToken: accessToken,
      userId,
    });
  } catch (e) {
    console.error("Error parsing Threads credential key", e, {
      credentialId: credential.id,
    });
  }

  console.debug("[threadsManager] credential parsing result", {
    credentialId: credential.id,
    accessTokenPresent: !!accessToken,
    userId,
  });

  if (!accessToken) {
    console.error("Error posting threads status: accessToken is null", {
      postId,
      credentialId: credential.id,
    });
    return false;
  }

  // Using "me" is supported by Threads; no need to resolve numeric ID. :contentReference[oaicite:4]{index=4}
  const user = userId || "me";

  try {
    console.debug("[threadsManager] creating post", {
      postId,
      userId: user,
      hasImages: !!postRec.imagesDataURL?.length,
    });

    const images = (postRec.imagesDataURL as string[]) || [];
    let threadsResult: any;

    if (images.length > 0) {
      // Validate URLs (Threads requires publicly accessible URLs)
      const bad = images.find((u) => !/^https?:\/\//i.test(u));
      if (bad) {
        throw new Error(
          "Threads requires public media URLs (no data URIs). Upload media to storage and provide HTTPS URLs."
        );
      }
      threadsResult =
        images.length === 1
          ? await createSingleMediaPost(
              user,
              accessToken,
              postRec.content,
              images[0]
            )
          : await createCarouselPost(
              user,
              accessToken,
              postRec.content,
              images
            );
    } else {
      threadsResult = await createTextPost(user, accessToken, postRec.content);
    }

    if (threadsResult) {
      await prisma.post.update({
        where: { id: postRec.id },
        data: {
          result: threadsResult,
          status: "POSTED",
          postedDate: new Date(),
        },
      });
      console.debug("[threadsManager] post successful", {
        postId,
        threadId: threadsResult.id,
        permalink: threadsResult.permalink,
      });
      return threadsResult;
    } else {
      await prisma.post.update({
        where: { id: postRec.id },
        data: { status: "ERROR" },
      });
      console.trace("[threadsManager] post failed - threadsResult falsy", {
        postId,
      });
      return false;
    }
  } catch (error: any) {
    console.error(
      "Error posting threads status:",
      error.response?.data || error.message,
      {
        postId,
      }
    );
    await prisma.post.update({
      where: { id: postRec.id },
      data: { status: "ERROR" },
    });
    return false;
  }
};

// Poll a container until it is ready
async function checkMediaLoaded(
  mediaContainerId: string,
  accessToken: string
): Promise<boolean> {
  console.debug("[threadsManager] checkMediaLoaded", { mediaContainerId });

  const url = `${GRAPH}/${mediaContainerId}`;
  const { data } = await axios.get(url, {
    params: {
      fields: "status,status_code,error_message",
      access_token: accessToken,
    },
  });

  const status = (data?.status || data?.status_code || "")
    .toString()
    .toUpperCase();
  const errMsg = data?.error_message;

  if (status === "ERROR") throw new Error(errMsg || "Media processing failed");
  if (status === "FINISHED") return true;

  await new Promise((r) => setTimeout(r, 2000));
  return checkMediaLoaded(mediaContainerId, accessToken);
}

// Try to fetch permalink for a node id; returns { id, permalink } or null
async function getLinkbyId(id: string, accessToken: string): Promise<{ id: string; permalink?: string } | null> {
  try {
    const { data } = await axios.get(`${GRAPH}/${id}`, {
      params: { fields: "id,permalink", access_token: accessToken },
    });
    return { id: data.id, permalink: data.permalink };
  } catch (error: any) {
    console.debug('[threadsManager] getLinkbyId failed', { id, error: error?.response?.data || error?.message });
    return null;
  }
}

// Create text-only post
async function createTextPost(
  userId: string,
  accessToken: string,
  message: string
) {
  const withRetries = async <T>(
    fn: () => Promise<T>,
    attempts = 3,
    baseDelay = 500
  ): Promise<T> => {
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        console.debug("[threadsManager] attempt", {
          fn: fn.name || "anonymous",
          attempt,
        });
        return await fn();
      } catch (err: any) {
        const errData = err?.response?.data;
        const isTransient =
          errData?.error?.is_transient ?? errData?.is_transient ?? false;
        console.error("[threadsManager] request error", {
          attempt,
          isTransient,
          error: errData || err.message,
        });
        if (attempt >= attempts || !isTransient) throw err;
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.debug("[threadsManager] retrying after delay", {
          attempt,
          delay,
        });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  };

  try {
    // Step 1: Create text container (form-encoded) then publish. :contentReference[oaicite:5]{index=5}
    const createResp = await withRetries(() =>
      postForm(`${GRAPH}/me/threads`, {
        media_type: "TEXT",
        text: message,
        access_token: accessToken,
        auto_publish_text: "true",
      })
    );

    console.debug("[threadsManager] createResp", {
      data: createResp.data,
      status: createResp.status,
    });

    const creationId = createResp.data.id;

    return { id: creationId };
  } catch (error: any) {
    console.error(
      "Error creating text post:",
      error.response?.data || error.message
    );
    return null;
  }
}

// Create single media post (image or video)
async function createSingleMediaPost(
  userId: string,
  accessToken: string,
  message: string,
  mediaUrl: string
) {
  try {
    const isVideo =
      /\.(mp4|mov|m4v)(\?|$)/i.test(mediaUrl) || /video/i.test(mediaUrl);
    const mediaType = isVideo ? "VIDEO" : "IMAGE";
    const mediaField = isVideo ? "video_url" : "image_url";

    const createResp = await postForm(`${GRAPH}/${userId}/threads`, {
      media_type: mediaType,
      [mediaField]: mediaUrl,
      text: message,
      access_token: accessToken,
    });

    const creationId = createResp.data.id;
    await checkMediaLoaded(creationId, accessToken);

    const publishResp = await postForm(`${GRAPH}/${userId}/threads_publish`, {
      creation_id: creationId,
      access_token: accessToken,
    });

    const threadId = publishResp.data.id;
    const { data: linkData } = await axios.get(`${GRAPH}/${threadId}`, {
      params: { fields: "id,permalink", access_token: accessToken },
    });

    return { id: threadId, permalink: linkData.permalink };
  } catch (error: any) {
    console.error(
      "Error creating single media post:",
      error.response?.data || error.message
    );
    return null;
  }
}

// Create carousel post (multiple media)
async function createCarouselPost(
  userId: string,
  accessToken: string,
  message: string,
  mediaUrls: string[]
) {
  try {
    // 1) Create children items
    const childIds: string[] = [];
    for (const mediaUrl of mediaUrls) {
      const isVideo =
        /\.(mp4|mov|m4v)(\?|$)/i.test(mediaUrl) || /video/i.test(mediaUrl);
      const mediaType = isVideo ? "VIDEO" : "IMAGE";
      const mediaField = isVideo ? "video_url" : "image_url";

      const { data } = await postForm(`${GRAPH}/${userId}/threads`, {
        media_type: mediaType,
        [mediaField]: mediaUrl,
        is_carousel_item: "true",
        access_token: accessToken,
      });

      childIds.push(data.id);
    }

    // 2) Wait for all children
    await Promise.all(childIds.map((id) => checkMediaLoaded(id, accessToken)));

    // 3) Create carousel container (children MUST be comma-separated) :contentReference[oaicite:6]{index=6}
    const carousel = await postForm(`${GRAPH}/${userId}/threads`, {
      media_type: "CAROUSEL",
      children: childIds.join(","),
      text: message,
      access_token: accessToken,
    });

    const creationId = carousel.data.id;
    await checkMediaLoaded(creationId, accessToken);

    // 4) Publish
    const publishResp = await postForm(`${GRAPH}/${userId}/threads_publish`, {
      creation_id: creationId,
      access_token: accessToken,
    });

    const threadId = publishResp.data.id;
    const { data: linkData } = await axios.get(`${GRAPH}/${threadId}`, {
      params: { fields: "id,permalink", access_token: accessToken },
    });

    return { id: threadId, permalink: linkData.permalink };
  } catch (error: any) {
    console.error(
      "Error creating carousel post:",
      error.response?.data || error.message
    );
    return null;
  }
}
