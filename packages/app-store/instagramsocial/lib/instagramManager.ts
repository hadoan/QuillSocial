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
  const [firstPost, ...theRest] = postDetails;
  const isStory = firstPost.settings?.post_type === "story";
  
  const medias = await Promise.all(
    firstPost?.media?.map(async (m) => {
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

      const response = await fetch(
        `https://${type}/v20.0/${id}/media?${mediaType}${isCarousel}${collaborators}&access_token=${accessToken}${caption}`,
        {
          method: "POST",
        }
      );
      const { id: photoId } = await response.json();

      let status = "IN_PROGRESS";
      while (status === "IN_PROGRESS") {
        const statusResponse = await fetch(
          `https://${type}/v20.0/${photoId}?access_token=${accessToken}&fields=status_code`
        );
        const { status_code } = await statusResponse.json();
        await timer(30000);
        status = status_code;
      }

      return photoId;
    }) || []
  );

  const arr: PostResponse[] = [];
  let containerIdGlobal = "";
  let linkGlobal = "";

  if (medias.length === 1) {
    const publishResponse = await fetch(
      `https://${type}/v20.0/${id}/media_publish?creation_id=${medias[0]}&access_token=${accessToken}&field=id`,
      {
        method: "POST",
      }
    );
    const { id: mediaId } = await publishResponse.json();
    containerIdGlobal = mediaId;

    const permalinkResponse = await fetch(
      `https://${type}/v20.0/${mediaId}?fields=permalink&access_token=${accessToken}`
    );
    const { permalink } = await permalinkResponse.json();

    arr.push({
      id: firstPost.id,
      postId: mediaId,
      releaseURL: permalink,
      status: "success",
    });

    linkGlobal = permalink;
  } else {
    const containerResponse = await fetch(
      `https://${type}/v20.0/${id}/media?caption=${encodeURIComponent(
        firstPost?.message
      )}&media_type=CAROUSEL&children=${encodeURIComponent(
        medias.join(",")
      )}&access_token=${accessToken}`,
      {
        method: "POST",
      }
    );
    const { id: containerId } = await containerResponse.json();

    let status = "IN_PROGRESS";
    while (status === "IN_PROGRESS") {
      const statusResponse = await fetch(
        `https://${type}/v20.0/${containerId}?fields=status_code&access_token=${accessToken}`
      );
      const { status_code } = await statusResponse.json();
      await timer(30000);
      status = status_code;
    }

    const publishResponse = await fetch(
      `https://${type}/v20.0/${id}/media_publish?creation_id=${containerId}&access_token=${accessToken}&field=id`,
      {
        method: "POST",
      }
    );
    const { id: mediaId } = await publishResponse.json();
    containerIdGlobal = mediaId;

    const permalinkResponse = await fetch(
      `https://${type}/v20.0/${mediaId}?fields=permalink&access_token=${accessToken}`
    );
    const { permalink } = await permalinkResponse.json();

    arr.push({
      id: firstPost.id,
      postId: mediaId,
      releaseURL: permalink,
      status: "success",
    });

    linkGlobal = permalink;
  }

  for (const post of theRest) {
    const commentResponse = await fetch(
      `https://${type}/v20.0/${containerIdGlobal}/comments?message=${encodeURIComponent(
        post.message
      )}&access_token=${accessToken}`,
      {
        method: "POST",
      }
    );
    const { id: commentId } = await commentResponse.json();

    arr.push({
      id: post.id,
      postId: commentId,
      releaseURL: linkGlobal,
      status: "success",
    });
  }

  return arr;
}

export const post = async (postId: number) => {
  const postRecord = await prisma.post.findUnique({ where: { id: postId } });
  if (!postRecord || !postRecord.credentialId) return false;

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
    console.error("Error posting instagram status: credential is null");
    return false;
  }

  const pageId =
    credentialWithPages.currentPageId ??
    credentialWithPages.pageInfoes?.[0]?.id;
  if (!pageId) {
    console.error(
      "Error posting instagram status: credential.currentPageId is null and no pageInfoes available"
    );
    return false;
  }

  const pageInfo = await prisma.pageInfo.findFirst({
    where: {
      id: pageId,
      credentialId: credentialWithPages.id,
    },
  });

  const pageAccessToken = (pageInfo?.info as any)?.access_token;
  if (!pageAccessToken) {
    console.error("Error posting instagram status: pageAccessToken is null");
    return false;
  }

  const images = postRecord.imagesDataURL as string[];

  const postDetails: PostDetails[] = [
    {
      id: postRecord.id.toString(),
      message: postRecord.content,
      media: images?.map((img) => ({ path: img })) || [],
    },
  ];

  try {
    const results = await postToInstagram(pageId, pageAccessToken, postDetails);

    if (results.length > 0 && results[0].status === "success") {
      await prisma.post.update({
        where: { id: postRecord.id },
        data: {
          result: results[0] as any,
          status: "POSTED",
          postedDate: new Date(),
        },
      });
      return results[0];
    } else {
      await prisma.post.update({
        where: { id: postRecord.id },
        data: { status: "ERROR" },
      });
      return false;
    }
  } catch (error: any) {
    console.error("Error posting status:", error.message);
    await prisma.post.update({
      where: { id: postRecord.id },
      data: { status: "ERROR" },
    });
    return false;
  }
};
