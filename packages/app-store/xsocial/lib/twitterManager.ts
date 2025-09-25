import { getClient } from "./getClient";
import prisma from "@quillsocial/prisma";

export const post = async (postId: number) => {
  try {
    const twitterPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!twitterPost || !twitterPost.credentialId) return false;
    const { refreshedClient } = await getClient(twitterPost.credentialId);
    if (!refreshedClient) {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "ERROR" },
      });
      return false;
    }

    // const mediaIds = await Promise.all(
    //   twitterPost.imagesDataURL?.map((dataUrl) => {
    //     const type = getImageTypeFromDataUrl(dataUrl) ?? "png";
    //     const base64Data = dataUrl.split(";base64,").pop() ?? "";
    //     const imageBuffer = Buffer.from(base64Data, "base64");
    //     return refreshedClient.v1.uploadMedia(imageBuffer, { type });
    //   })
    // );

    // const mediaIds = await Promise.all([
    //   // file path
    //   client.v1.uploadMedia("./my-image.jpg"),
    //   // from a buffer, for example obtained with an image modifier package
    //   client.v1.uploadMedia(Buffer.from(rotatedImage), { type: "png" }),
    // ]);

    // const response = mediaIds
    //   ? await newClient.v1.tweet(
    //     twitterPost.content, {

    //     media_ids: mediaIds,
    //   }
    //   )
    //   : await refreshedClient.v2.tweet({
    //     text: twitterPost.content,
    //   });
    const response = await refreshedClient.v2.tweet({
      text: twitterPost.content,
    });

    if (response.errors) {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "ERROR" },
      });
      console.error(response.errors);
      return false;
    } else {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "POSTED", postedDate: new Date() },
      });
      return true;
    }
    return true;
  } catch (error) {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "ERROR" },
    });
    console.error(error);
    return false;
  }
};

function getImageTypeFromDataUrl(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,/);
  return match ? match[1] : null;
}
