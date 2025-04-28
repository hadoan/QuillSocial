import axios from "axios";
import prisma from "@quillsocial/prisma";
import { facebookCredentialSchema } from "./facebookCredentialSchema";
import fs from "fs";
import path from "path";
import FormData from "form-data";

export const post = async (postId: number) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || !post.credentialId) return false;

  const credential = await prisma.credential.findUnique({
    where: {
      id: post.credentialId,
    },
  });
  if (!credential || !credential.currentPageId) {
    console.error("Error posting instagram status: credential is null or credential.currentPageId is null",);
    return false;
  }
  const pageInfo = await prisma.pageInfo.findUnique({
    where: {
      id: credential.currentPageId
    }
  });
  const pageAccessToken = (pageInfo?.info as any)?.access_token;
  if (!pageAccessToken) {
    console.error("Error posting facebook status: pageAccessToken is null",);
    return false;
  }
  const images = post.imagesDataURL as string[];
  const imgSrc = images && images.length > 0 ? images[0] : "";

  if (imgSrc) {
    const postResult = await uploadPhotoToFacebook(post.content, imgSrc, credential.currentPageId, pageAccessToken);
    if (postResult) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          result: postResult,
          status: "POSTED", postedDate: new Date()
        }
      });
    } else {
      await prisma.post.update({ where: { id: post.id }, data: { status: "ERROR" } });
      return false;
    }
  } else {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${credential.currentPageId}/feed`,
        {
          message: post.content,
          // ...(mediaData && { attached_media: mediaData }),
        },
        {
          params: {
            access_token: pageAccessToken,
          },
          responseType: "json",
        }
      );

      // console.log(response.data);
      // { id: '527734624756255_692615263084494' }
      // console.log("Status Posted! Post ID:", postId);
      if (response.data) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            result: response.data,
            status: "POSTED", postedDate: new Date()
          }
        });
      }
      return response.data;
    } catch (error: any) {
      console.error("Error posting status:", error.response?.data || error.message);
      await prisma.post.update({ where: { id: post.id }, data: { status: "ERROR" } });
      return false;
    }
  }
};


async function getImageTypeAndBase64(dataImageUrl: string): Promise<{ type: string; base64: string }> {
  // Extract base64 data from the data URL
  const base64Data = dataImageUrl.split(',')[1];

  // Convert base64 to binary Buffer
  const binaryData = Buffer.from(base64Data, 'base64');

  // Determine the image type
  const type = binaryData.slice(0, 2).toString('hex');
  return { type, base64: base64Data };
}


async function uploadPhotoToFacebook(caption: string, dataImageUrl: string, pageId: string, accessToken: string) {
  try {
    // Extract base64 data from the data URL
    const base64Data = dataImageUrl.split(',')[1];

    // Create a Buffer from the base64 data
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Write the Buffer to a temporary file
    const tempImagePath = path.join(__dirname, 'temp_photo.jpg');
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Create a FormData object and append the image file
    const formData = new FormData();
    formData.append('source', fs.createReadStream(tempImagePath));
    formData.append('caption', caption);

    // Make a POST request to upload the photo
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${pageId}/photos?access_token=${accessToken}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    console.log('Photo uploaded:', response.data);
    // Photo uploaded: { id: '692607053085315', post_id: '527734624756255_692607083085312' }
    // Delete the temporary file
    fs.unlinkSync(tempImagePath);
    return response.data;
  } catch (error: any) {
    console.error('Error uploading photo:', error.response?.data || error.message);
    return null;
  }
}
