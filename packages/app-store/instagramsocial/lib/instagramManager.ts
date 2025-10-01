import logger from "@quillsocial/lib/logger";
import prisma from "@quillsocial/prisma";

export interface PostDetails {
  id: string;
  message: string;
  media?: Array<{
    path: string;
    thumbnailTimestamp?: number;
  }>;
  settings?: {
    post_type?: "story" | "post";
    collaborators?: Array<{ label: string }>;
  };
}

export interface PostResponse {
  id: string;
  postId: string;
  releaseURL: string;
  status: string;
}

// Helper function to wait
const timer = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper function to post to Instagram
async function postToInstagram(
  id: string,
  accessToken: string,
  postDetails: PostDetails[],
  type = "graph.facebook.com"
): Promise<PostResponse[]> {
  logger.info("🚀 [Instagram] Starting postToInstagram...");
  logger.info("📋 [Instagram] Instagram User ID:", id);
  logger.info("🔑 [Instagram] Access Token:", accessToken ? `${accessToken.substring(0, 20)}...` : "MISSING");
  logger.info("📝 [Instagram] Post details:", JSON.stringify(postDetails, null, 2));

  const [firstPost, ...theRest] = postDetails;
  const isStory = firstPost.settings?.post_type === "story";

  logger.info("📌 [Instagram] Post type:", isStory ? "STORY" : "POST/REEL");
  logger.info("📸 [Instagram] Media count:", firstPost?.media?.length || 0);

  // Instagram API requires at least one media item (image or video)
  if (!firstPost?.media || firstPost.media.length === 0) {
    const errorMsg = "Instagram does not support text-only posts. Please add at least one image or video.";
    logger.error(`❌ [Instagram] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const medias = await Promise.all(
    firstPost?.media?.map(async (m, index) => {
      logger.info(`\n📷 [Instagram] Processing media ${index + 1}/${firstPost.media?.length}...`);
      logger.info(`   URL: ${m.path}`);

      const caption =
        firstPost.media?.length === 1
          ? `&caption=${encodeURIComponent(firstPost.message)}`
          : ``;
      const isCarousel =
        (firstPost?.media?.length || 0) > 1 ? `&is_carousel_item=true` : ``;
      const mediaType =
        m.path.indexOf(".mp4") > -1
          ? firstPost?.media?.length === 1
            ? isStory
              ? `video_url=${m.path}&media_type=STORIES`
              : `video_url=${m.path}&media_type=REELS&thumb_offset=${
                  m?.thumbnailTimestamp || 0
                }`
            : isStory
            ? `video_url=${m.path}&media_type=STORIES`
            : `video_url=${m.path}&media_type=VIDEO&thumb_offset=${
                m?.thumbnailTimestamp || 0
              }`
          : isStory
          ? `image_url=${m.path}&media_type=STORIES`
          : `image_url=${m.path}`;

      const collaborators =
        firstPost?.settings?.collaborators?.length && !isStory
          ? `&collaborators=${JSON.stringify(
              firstPost?.settings?.collaborators.map((p) => p.label)
            )}`
          : ``;

      const mediaUrl = `https://${type}/v20.0/${id}/media?${mediaType}${isCarousel}${collaborators}&access_token=${accessToken}${caption}`;
      logger.info(`   🌐 [Instagram] Creating media container...`);
      logger.info(`   📡 [Instagram] API URL: https://${type}/v20.0/${id}/media?${mediaType}${isCarousel}${collaborators}${caption ? '&caption=[REDACTED]' : ''}`);

      const response = await fetch(mediaUrl, {
        method: "POST",
      });

      const responseData = await response.json();
      logger.info(`   📥 [Instagram] Media creation response:`, JSON.stringify(responseData, null, 2));

      if (!response.ok || !responseData.id) {
        logger.error(`   ❌ [Instagram] Failed to create media container:`, responseData);
        throw new Error(`Failed to create media: ${JSON.stringify(responseData)}`);
      }

      const { id: photoId } = responseData;
      logger.info(`   ✅ [Instagram] Media container created: ${photoId}`);

      let status = "IN_PROGRESS";
      let attempts = 0;
      const maxAttempts = 20; // Max 10 minutes (20 * 30s)

      while (status === "IN_PROGRESS" && attempts < maxAttempts) {
        attempts++;
        logger.info(`   ⏳ [Instagram] Checking media status (attempt ${attempts}/${maxAttempts})...`);

        const statusResponse = await fetch(
          `https://${type}/v20.0/${photoId}?access_token=${accessToken}&fields=status_code`
        );
        const statusData = await statusResponse.json();
        logger.info(`   📊 [Instagram] Status response:`, JSON.stringify(statusData, null, 2));

        if (statusData.error) {
          logger.error(`   ❌ [Instagram] Error checking status:`, statusData.error);
          throw new Error(`Status check failed: ${JSON.stringify(statusData.error)}`);
        }

        const { status_code } = statusData;
        status = status_code;

        if (status === "IN_PROGRESS") {
          logger.info(`   ⏸️  [Instagram] Still processing, waiting 30 seconds...`);
          await timer(30000);
        } else if (status === "FINISHED") {
          logger.info(`   ✅ [Instagram] Media processing complete!`);
        } else if (status === "ERROR") {
          logger.error(`   ❌ [Instagram] Media processing failed with status: ${status}`);
          throw new Error(`Media processing failed: ${status}`);
        }
      }

      if (attempts >= maxAttempts) {
        logger.error(`   ❌ [Instagram] Media processing timeout after ${maxAttempts} attempts`);
        throw new Error(`Media processing timeout`);
      }

      return photoId;
    }) || []
  );

  logger.info(`\n✅ [Instagram] All media containers processed: ${medias.length} items`);
  logger.info(`📦 [Instagram] Media IDs:`, medias);

  const arr: PostResponse[] = [];
  let containerIdGlobal = "";
  let linkGlobal = "";

  if (medias.length === 1) {
    logger.info(`\n📤 [Instagram] Publishing single media...`);
    const publishUrl = `https://${type}/v20.0/${id}/media_publish?creation_id=${medias[0]}&access_token=${accessToken}&field=id`;
    logger.info(`   📡 [Instagram] Publish URL: https://${type}/v20.0/${id}/media_publish?creation_id=${medias[0]}&field=id`);

    const publishResponse = await fetch(publishUrl, {
      method: "POST",
    });

    const publishData = await publishResponse.json();
    logger.info(`   📥 [Instagram] Publish response:`, JSON.stringify(publishData, null, 2));

    if (!publishResponse.ok || !publishData.id) {
      logger.error(`   ❌ [Instagram] Failed to publish:`, publishData);
      throw new Error(`Failed to publish: ${JSON.stringify(publishData)}`);
    }

    const { id: mediaId } = publishData;
    containerIdGlobal = mediaId;
    logger.info(`   ✅ [Instagram] Published! Media ID: ${mediaId}`);

    logger.info(`   🔗 [Instagram] Fetching permalink...`);
    const permalinkResponse = await fetch(
      `https://${type}/v20.0/${mediaId}?fields=permalink&access_token=${accessToken}`
    );
    const permalinkData = await permalinkResponse.json();
    logger.info(`   📥 [Instagram] Permalink response:`, JSON.stringify(permalinkData, null, 2));

    const { permalink } = permalinkData;
    logger.info(`   🔗 [Instagram] Permalink: ${permalink}`);

    arr.push({
      id: firstPost.id,
      postId: mediaId,
      releaseURL: permalink,
      status: "success",
    });

    linkGlobal = permalink;
  } else {
    logger.info(`\n📤 [Instagram] Creating carousel with ${medias.length} items...`);
    const containerUrl = `https://${type}/v20.0/${id}/media?caption=${encodeURIComponent(
      firstPost?.message
    )}&media_type=CAROUSEL&children=${encodeURIComponent(
      medias.join(",")
    )}&access_token=${accessToken}`;
    logger.info(`   📡 [Instagram] Carousel container URL: https://${type}/v20.0/${id}/media?media_type=CAROUSEL&children=[REDACTED]&caption=[REDACTED]`);

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
    });

    const containerData = await containerResponse.json();
    logger.info(`   📥 [Instagram] Carousel creation response:`, JSON.stringify(containerData, null, 2));

    if (!containerResponse.ok || !containerData.id) {
      logger.error(`   ❌ [Instagram] Failed to create carousel:`, containerData);
      throw new Error(`Failed to create carousel: ${JSON.stringify(containerData)}`);
    }

    const { id: containerId } = containerData;
    logger.info(`   ✅ [Instagram] Carousel container created: ${containerId}`);

    let status = "IN_PROGRESS";
    let attempts = 0;
    const maxAttempts = 20;

    while (status === "IN_PROGRESS" && attempts < maxAttempts) {
      attempts++;
      logger.info(`   ⏳ [Instagram] Checking carousel status (attempt ${attempts}/${maxAttempts})...`);

      const statusResponse = await fetch(
        `https://${type}/v20.0/${containerId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusResponse.json();
      logger.info(`   📊 [Instagram] Carousel status:`, JSON.stringify(statusData, null, 2));

      if (statusData.error) {
        logger.error(`   ❌ [Instagram] Error checking carousel status:`, statusData.error);
        throw new Error(`Carousel status check failed: ${JSON.stringify(statusData.error)}`);
      }

      const { status_code } = statusData;
      status = status_code;

      if (status === "IN_PROGRESS") {
        logger.info(`   ⏸️  [Instagram] Carousel still processing, waiting 30 seconds...`);
        await timer(30000);
      } else if (status === "FINISHED") {
        logger.info(`   ✅ [Instagram] Carousel processing complete!`);
      } else if (status === "ERROR") {
        logger.error(`   ❌ [Instagram] Carousel processing failed: ${status}`);
        throw new Error(`Carousel processing failed: ${status}`);
      }
    }

    if (attempts >= maxAttempts) {
      logger.error(`   ❌ [Instagram] Carousel processing timeout`);
      throw new Error(`Carousel processing timeout`);
    }

    logger.info(`   📤 [Instagram] Publishing carousel...`);
    const publishResponse = await fetch(
      `https://${type}/v20.0/${id}/media_publish?creation_id=${containerId}&access_token=${accessToken}&field=id`,
      {
        method: "POST",
      }
    );

    const publishData = await publishResponse.json();
    logger.info(`   📥 [Instagram] Carousel publish response:`, JSON.stringify(publishData, null, 2));

    if (!publishResponse.ok || !publishData.id) {
      logger.error(`   ❌ [Instagram] Failed to publish carousel:`, publishData);
      throw new Error(`Failed to publish carousel: ${JSON.stringify(publishData)}`);
    }

    const { id: mediaId } = publishData;
    containerIdGlobal = mediaId;
    logger.info(`   ✅ [Instagram] Carousel published! Media ID: ${mediaId}`);

    logger.info(`   🔗 [Instagram] Fetching carousel permalink...`);
    logger.info(`   🔗 [Instagram] Fetching carousel permalink...`);
    const permalinkResponse = await fetch(
      `https://${type}/v20.0/${mediaId}?fields=permalink&access_token=${accessToken}`
    );
    const permalinkData = await permalinkResponse.json();
    logger.info(`   📥 [Instagram] Carousel permalink response:`, JSON.stringify(permalinkData, null, 2));

    const { permalink } = permalinkData;
    logger.info(`   🔗 [Instagram] Carousel permalink: ${permalink}`);

    arr.push({
      id: firstPost.id,
      postId: mediaId,
      releaseURL: permalink,
      status: "success",
    });

    linkGlobal = permalink;
  }

  // Handle threaded comments
  if (theRest.length > 0) {
    logger.info(`\n💬 [Instagram] Adding ${theRest.length} comment(s)...`);
  }

  for (const post of theRest) {
    logger.info(`   💬 [Instagram] Adding comment for post ID ${post.id}...`);
    const commentResponse = await fetch(
      `https://${type}/v20.0/${containerIdGlobal}/comments?message=${encodeURIComponent(
        post.message
      )}&access_token=${accessToken}`,
      {
        method: "POST",
      }
    );
    const commentData = await commentResponse.json();
    logger.info(`   📥 [Instagram] Comment response:`, JSON.stringify(commentData, null, 2));

    if (!commentResponse.ok || !commentData.id) {
      logger.error(`   ❌ [Instagram] Failed to add comment:`, commentData);
    } else {
      logger.info(`   ✅ [Instagram] Comment added: ${commentData.id}`);
    }

    const { id: commentId } = commentData;

    arr.push({
      id: post.id,
      postId: commentId,
      releaseURL: linkGlobal,
      status: "success",
    });
  }

  logger.info(`\n🎉 [Instagram] Post completed successfully!`);
  logger.info(`📊 [Instagram] Results:`, JSON.stringify(arr, null, 2));

  return arr;
}

export const post = async (postId: number) => {
  logger.info(`\n🚀 [Instagram] ========================================`);
  logger.info(`🚀 [Instagram] Starting Instagram post workflow`);
  logger.info(`🚀 [Instagram] Post ID: ${postId}`);
  logger.info(`🚀 [Instagram] ========================================\n`);

  const postRecord = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      cloudFiles: {
        include: {
          cloudFile: true
        }
      }
    }
  });

  if (!postRecord) {
    logger.error(`❌ [Instagram] Post record not found for ID: ${postId}`);
    return false;
  }

  logger.info(`✅ [Instagram] Post record found`);
  logger.info(`📝 [Instagram] Content: ${postRecord.content?.substring(0, 100)}${postRecord.content?.length > 100 ? '...' : ''}`);
  logger.info(`🔑 [Instagram] Credential ID: ${postRecord.credentialId}`);

  if (!postRecord.credentialId) {
    logger.error(`❌ [Instagram] Post has no credentialId`);
    return false;
  }

  logger.info(`\n🔍 [Instagram] Fetching credential and page information...`);
  const credentialWithPages = await prisma.credential.findUnique({
    where: { id: postRecord.credentialId },
    select: {
      id: true,
      currentPageId: true,
      pageInfoes: {
        select: {
          id: true,
          info: true,
        },
      },
    },
  });

  if (!credentialWithPages) {
    logger.error(`❌ [Instagram] Credential not found for ID: ${postRecord.credentialId}`);
    return false;
  }

  logger.info(`✅ [Instagram] Credential found: ID ${credentialWithPages.id}`);
  logger.info(`📄 [Instagram] Current Page ID: ${credentialWithPages.currentPageId || 'Not set'}`);
  logger.info(`📄 [Instagram] Available pages: ${credentialWithPages.pageInfoes?.length || 0}`);

  const pageId =
    credentialWithPages.currentPageId ??
    credentialWithPages.pageInfoes?.[0]?.id;

  if (!pageId) {
    logger.error(`❌ [Instagram] No page ID available. currentPageId: ${credentialWithPages.currentPageId}, pageInfoes: ${JSON.stringify(credentialWithPages.pageInfoes)}`);
    return false;
  }

  logger.info(`✅ [Instagram] Using page ID: ${pageId}`);

  logger.info(`\n🔍 [Instagram] Fetching page info for page ID: ${pageId}...`);
  const pageInfo = await prisma.pageInfo.findFirst({
    where: {
      id: pageId,
      credentialId: credentialWithPages.id,
    },
  });

  if (!pageInfo) {
    logger.error(`❌ [Instagram] PageInfo not found for page ID: ${pageId}, credential ID: ${credentialWithPages.id}`);
    return false;
  }

  logger.info(`✅ [Instagram] PageInfo found:`, JSON.stringify({
    id: pageInfo.id,
    name: pageInfo.name,
    hasInfo: !!pageInfo.info,
  }, null, 2));

  const pageAccessToken = (pageInfo?.info as any)?.access_token;

  if (!pageAccessToken) {
    logger.error(`❌ [Instagram] No access_token in pageInfo.info`);
    logger.error(`   PageInfo.info content:`, JSON.stringify(pageInfo.info, null, 2));
    return false;
  }

  logger.info(`✅ [Instagram] Page access token found: ${pageAccessToken.substring(0, 20)}...`);

  // Get images from cloudFiles (new GCS URLs) or imagesDataURL (legacy base64)
  logger.info(`\n📸 [Instagram] Checking for images...`);
  logger.info(`   CloudFiles count: ${postRecord.cloudFiles?.length || 0}`);
  logger.info(`   ImagesDataURL count: ${postRecord.imagesDataURL?.length || 0}`);

  let images: string[] = [];

  // Priority 1: Use CloudFile public URLs (Instagram-compatible)
  if (postRecord.cloudFiles && postRecord.cloudFiles.length > 0) {
    const bucketName = process.env.GCP_BUCKET_NAME || "quillsocial-files";
    images = postRecord.cloudFiles.map(cf => {
      if (cf.cloudFile) {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/instagram/${cf.cloudFile.cloudFileId}.${cf.cloudFile.fileExt}`;
        logger.info(`   ✅ Using GCS public URL: ${publicUrl}`);
        return publicUrl;
      }
      return "";
    }).filter(url => url !== "");
  }

  // Priority 2: Fallback to imagesDataURL (legacy, may fail for Instagram)
  if (images.length === 0 && postRecord.imagesDataURL && postRecord.imagesDataURL.length > 0) {
    images = postRecord.imagesDataURL as string[];
    const hasBase64 = images.some(img => img.startsWith('data:'));
    if (hasBase64) {
      logger.warn(`   ⚠️ Using legacy base64 images - Instagram posting will likely fail!`);
      logger.warn(`   ⚠️ Please use AddImageDialog to upload images to Google Cloud Storage`);
    } else {
      logger.info(`   ✅ Using HTTP/HTTPS URLs from imagesDataURL`);
    }
  }

  logger.info(`\n📸 [Instagram] Total images to post: ${images?.length || 0}`);

  // Validate that we have media to post
  if (!images || images.length === 0) {
    const errorMsg = "❌ Instagram requires at least one image or video. Text-only posts are not supported.";
    logger.error(errorMsg);
    await prisma.post.update({
      where: { id: postRecord.id },
      data: {
        status: "ERROR",
        result: { error: "Instagram does not support text-only posts. Please add at least one image or video." } as any
      },
    });
    return false;
  }

  // Validate image format
  logger.info(`\n🔍 [Instagram] Validating image URLs...`);

  if (images && images.length > 0) {
    const hasBase64 = images.some(img => img.startsWith('data:'));
    const hasGCS = images.some(img => img.includes('storage.googleapis.com'));

    if (hasBase64) {
      logger.warn(`⚠️ [Instagram] WARNING: Base64 images detected - posting will likely fail!`);
      logger.warn(`⚠️ [Instagram] Please use AddImageDialog to upload images to Google Cloud Storage`);
    }

    if (hasGCS) {
      logger.info(`✅ [Instagram] Using GCS public URLs - compatible with Instagram API`);
    }

    images.forEach((img, idx) => {
      const urlType = img.startsWith('data:') ? '❌ BASE64' : img.includes('storage.googleapis.com') ? '✅ GCS' : '⚠️ OTHER';
      logger.info(`   ${idx + 1}. [${urlType}] ${img.substring(0, 100)}${img.length > 100 ? '...' : ''}`);
    });
  }

  const postDetails: PostDetails[] = [
    {
      id: postRecord.id.toString(),
      message: postRecord.content,
      media: images?.map((img) => ({ path: img })) || [],
    },
  ];

  try {
    logger.info(`\n📤 [Instagram] Calling postToInstagram...`);
    const results = await postToInstagram(pageId, pageAccessToken, postDetails);

    logger.info(`\n📊 [Instagram] Post results received:`, JSON.stringify(results, null, 2));

    if (results.length > 0 && results[0].status === "success") {
      logger.info(`✅ [Instagram] Post successful! Updating database...`);
      await prisma.post.update({
        where: { id: postRecord.id },
        data: {
          result: results[0] as any,
          status: "POSTED",
          postedDate: new Date(),
        },
      });
      logger.info(`✅ [Instagram] Database updated with POSTED status`);
      logger.info(`🔗 [Instagram] Post URL: ${results[0].releaseURL}`);
      logger.info(`\n🎉 [Instagram] ========================================`);
      logger.info(`🎉 [Instagram] Instagram post completed successfully!`);
      logger.info(`🎉 [Instagram] ========================================\n`);
      return results[0];
    } else {
      logger.error(`❌ [Instagram] Post failed - no successful results`);
      logger.error(`   Results:`, JSON.stringify(results, null, 2));
      await prisma.post.update({
        where: { id: postRecord.id },
        data: { status: "ERROR" },
      });
      logger.info(`⚠️  [Instagram] Database updated with ERROR status`);
      return false;
    }
  } catch (error: any) {
    logger.error(`\n❌ [Instagram] ========================================`);
    logger.error(`❌ [Instagram] Error posting to Instagram`);
    logger.error(`❌ [Instagram] ========================================`);
    logger.error(`❌ [Instagram] Error message:`, error.message);
    logger.error(`❌ [Instagram] Error stack:`, error.stack);
    if (error.response) {
      logger.error(`❌ [Instagram] Response data:`, JSON.stringify(error.response.data, null, 2));
    }

    // Store error details in the database
    const errorDetails = {
      error: error.message,
      timestamp: new Date().toISOString(),
      details: error.response?.data || error.stack
    };

    await prisma.post.update({
      where: { id: postRecord.id },
      data: {
        status: "ERROR",
        result: errorDetails as any
      },
    });
    logger.info(`⚠️  [Instagram] Database updated with ERROR status and error details`);
    return false;
  }
};
