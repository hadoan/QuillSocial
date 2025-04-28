
import prisma from "@quillsocial/prisma";

import { getFileExtensionFromImageDataUrl } from "../../_utils/dataURLToStream";
import { getClient } from "./getClient";

export const post = async (postId: number) => {
  try {
    const twitterPost = await prisma.post.findUnique({ where: { id: postId } });
    console.log(twitterPost);
    if (!twitterPost || !twitterPost.credentialId) return false;
    const { clientV1 } = await getClient(twitterPost.credentialId);
    if (!clientV1) {
      await prisma.post.update({ where: { id: twitterPost.id }, data: { status: "ERROR" } });
      return false;
    }
    let media_ids: any[] | undefined = undefined;

    const images = twitterPost.imagesDataURL as string[];
    const imgSrc = images && images.length > 0 ? images[0] : "";
    if (imgSrc) {
      const base64Data = imgSrc.split(",")[1]; // Extract the base64 data part
      const buffer = Buffer.from(base64Data, "base64");

      const media = await clientV1.v1.uploadMedia(buffer, {
        type: getFileExtensionFromImageDataUrl(imgSrc) ?? "png",
      });
      media_ids = [media];
    }

    const response = media_ids
      ? await clientV1.v2.tweet(twitterPost.content, {
        media: {
          // media_ids,
        },
      })
      : await clientV1.v2.tweet(twitterPost.content);

    if (!response) {
      await prisma.post.update({ where: { id: twitterPost.id }, data: { status: "ERROR" } });
      console.error(response);
      return false;
    } else {
      await prisma.post.update({
        where: { id: twitterPost.id },
        data: { status: "POSTED", postedDate: new Date(), result: { response: JSON.parse(JSON.stringify(response)) } },
      });
      return true;
    }
  } catch (error) {
    await prisma.post.update({ where: { id: postId }, data: { status: "ERROR" } });
    console.error("Twitter Post", error);
    return false;
  }
};

export const commentPost = async (credentialId: number | null, plugId: number, content: string, postResult: any) => {
  try {
    console.log("commentPost", credentialId, plugId, postResult);
    if (!credentialId) return false;
    const { clientV1 } = await getClient(credentialId);
    if (!clientV1) {
      await prisma.plug.update({ where: { id: plugId }, data: { status: "ERROR" } });
      return false;
    }

    const response = await clientV1.v2.reply(content, postResult.response.data.id);

    if (!response) {
      await prisma.plug.update({ where: { id: plugId }, data: { status: "ERROR" } });
      console.error(response);
      return false;
    } else {
      await prisma.plug.update({
        where: { id: plugId },
        data: { status: "POSTED", postedDate: new Date(), result: { response: JSON.parse(JSON.stringify(response)) } },
      });
      return true;
    }
  } catch (error) {
    await prisma.plug.update({ where: { id: plugId }, data: { status: "ERROR" } });
    console.error(error);
    return false;
  }
}
