import prisma from "@quillsocial/prisma";
import { getXConsumerKeysClient } from "./getClient";

export const post = async (postId: number) => {
  try {
    const twitterPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        credential: true
      }
    });

    if (!twitterPost || !twitterPost.credentialId) {
      console.error("Post not found or no credential ID");
      return false;
    }

    // Check if this is an xconsumerkeys-social credential
    if (twitterPost.credential?.appId !== "xconsumerkeys-social") {
      console.error("This post is not associated with xconsumerkeys-social");
      return false;
    }

    const { client, credentials } = await getXConsumerKeysClient(twitterPost.credentialId);

    if (!client || !credentials) {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "ERROR" },
      });
      console.error("Could not create Twitter client with consumer keys");
      return false;
    }

    // Look for an associated X Social credential with user access tokens for this user
    const xSocialCredential = await prisma.credential.findFirst({
      where: {
        userId: twitterPost.userId,
        appId: "x-social",
        invalid: false
      }
    });

    if (!xSocialCredential) {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: {
          status: "ERROR",
        },
      });
      console.error("No X Social account found for this user. Consumer keys alone cannot post tweets - user authentication is required.");
      return false;
    }

    // Use the xsocial posting mechanism since we have user tokens there
    const { post: xSocialPost } = await import("../../xsocial/lib/twitterManager");

    // Temporarily update the post to use the x-social credential
    await prisma.post.update({
      where: { id: postId },
      data: { credentialId: xSocialCredential.id }
    });

    const result = await xSocialPost(postId);

    // Restore the original credential reference
    await prisma.post.update({
      where: { id: postId },
      data: { credentialId: twitterPost.credentialId }
    });

    return result;

  } catch (error) {
    console.error("Error posting with consumer keys:", error);
    await prisma.post.update({
      where: { id: postId },
      data: { status: "ERROR" },
    });
    return false;
  }
};
