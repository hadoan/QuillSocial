import { getXConsumerKeysClient } from "./getClient";
import prisma from "@quillsocial/prisma";

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

    if (!twitterPost || !twitterPost.credentialId) {
      console.error("Post not found or no credential ID");
      return { success: false, error: "Post not found or no credential ID" };
    }

    // Check if this is an xconsumerkeys-social credential
    if (twitterPost.credential?.appId !== "xconsumerkeys-social") {
      console.error("This post is not associated with xconsumerkeys-social");
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
      console.error("Could not create Twitter client with consumer keys");
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
        console.error("No content to post");
        return { success: false, error: "No content to post" };
      }

      // Post the tweet
      console.log(
        "Attempting to post tweet with access tokens. If you get a 403 error after this, your access tokens were generated BEFORE changing app permissions to read-write."
      );
      const tweet = await client.tweet(tweetText);

      await prisma.post.update({
        where: { id: twitterPost.id },
        data: {
          status: "POSTED",
          postedDate: new Date(),
        },
      });

      console.log(
        "Tweet posted successfully with consumer keys and access tokens:"
      );
      return { success: true };
    } catch (error: any) {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "ERROR" },
      });
      console.error("Error posting tweet:", error);

      // Check if it's a permissions error
      if (error.code === 403) {
        if (error.data?.detail?.includes("oauth1 app permissions")) {
          return {
            success: false,
            error:
              "Twitter app permission error: Your Twitter app only has read permissions. Please go to Twitter Developer Portal → App Settings → Set up → App permissions → Change to 'Read and write' permissions, then regenerate your access tokens.",
          };
        } else if (
          error.data?.detail?.includes(
            "You are not permitted to perform this action"
          )
        ) {
          console.error(
            "⚠️  IMPORTANT: This error typically means your access tokens were generated BEFORE you changed app permissions to read-write."
          );
          console.error(
            "📝 SOLUTION: Go to Twitter Developer Portal → Your App → Keys and tokens → Regenerate Access Token & Secret"
          );
          return {
            success: false,
            error:
              "❌ Access Token Issue: Your access tokens were generated before changing app permissions to read-write. SOLUTION: Go to Twitter Developer Portal → Your App → Keys and tokens → Click 'Regenerate' for Access Token & Secret → Update your QuillSocial credentials with the NEW tokens.",
          };
        } else {
          return {
            success: false,
            error: `Twitter permission error (403): ${
              error.data?.detail || error.data?.title || "Access denied"
            }. Please check your app permissions and regenerate access tokens in Twitter Developer Portal.`,
          };
        }
      } else {
        return {
          success: false,
          error: `Failed to post tweet: ${error.message || "Unknown error"}`,
        };
      }
    }
  } catch (error) {
    console.error("Error posting with consumer keys:", error);
    await prisma.post.update({
      where: { id: postId },
      data: { status: "ERROR" },
    });
    return {
      success: false,
      error: `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};
