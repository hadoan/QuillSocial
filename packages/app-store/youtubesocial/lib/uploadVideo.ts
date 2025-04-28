import { google } from "googleapis";
import fs from "fs";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { prisma } from "@quillsocial/prisma";
import { z } from "zod";
import { getFile } from "@quillsocial/googlecloudstorage/lib/getFile";
import downloadFile from "@quillsocial/googlecloudstorage/lib/downloadFile";

const credentialsSchema = z.object({
  refresh_token: z.string().optional(),
  expiry_date: z.number().optional(),
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
});

export async function uploadVideo(userId: number, postId: number) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      credentialId: true,
      content: true,
      cloudFiles: {
        select: {
          cloudFile: {
            select: {
              cloudFileId: true,
              fileExt: true,
            },
          },
        },
      },
    },
  });
  if (!post || !post.credentialId) return false;

  const { client_id, client_secret } = await getAppKeysFromSlug(
    "google-calendar"
  );
  if (!client_id || typeof client_id !== "string")
    throw new Error("Google client_id missing.");
  if (!client_secret || typeof client_secret !== "string")
    throw new Error("Google client_secret missing.");
  const redirect_uri = WEBAPP_URL + "/api/integrations/youtubesocial/callback";

  const hasExistingCredentials = await prisma.credential.findUnique({
    where: {
      id: post.credentialId,
    },
  });
  if (!hasExistingCredentials) {
    throw new Error("No Youtube credentials found");
  }
  const videoFileName =
    post.cloudFiles &&
    post.cloudFiles.length > 0 &&
    post.cloudFiles[0].cloudFile?.cloudFileId
      ? `${post.cloudFiles[0].cloudFile?.cloudFileId}.${post.cloudFiles[0].cloudFile?.fileExt}`
      : undefined;
  if (!videoFileName) {
    throw new Error("No Video file found in post object");
  }
  const url = await getFile(videoFileName);
  if (!url) {
    throw new Error("No Video URL found in post object");
  }
  await downloadFile(url, videoFileName);

  const credentials = credentialsSchema.parse(hasExistingCredentials.key);

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  oauth2Client.setCredentials({
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
  try {
    const res = await youtube.videos.insert(
      {
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: post.content,
            description: "",
            // tags: ['test', 'video', 'youtube'],
            // categoryId: '22',
          },
          status: {
            // privacyStatus: 'private',
          },
        },
        media: {
          body: fs.createReadStream(videoFileName),
        },
      },
      {
        // Use the 'onUploadProgress' event from Axios to log upload progress
        onUploadProgress: (evt) => {
          // const progress = (evt.bytesRead / fileSize) * 100;
          console.log(`${Math.round(evt.bytesRead)} bytes complete`);
        },
      }
    );

    if (!res) {
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "ERROR" },
      });
      return false;
    } else {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: "POSTED",
          postedDate: new Date(),
          result: { response: JSON.parse(JSON.stringify(res.data)) },
        },
      });
      return true;
    }
  } catch (error) {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: "ERROR" },
    });
    return false;
  }

  // console.log('Upload Successful', res.data);

  // {
  //     //    kind: 'youtube#video',
  //     //    etag: 'ypDUnY8pFLQDvGjURBx_Iki_tcg',
  //     //    id: 'HbJQEV_iX3A',
  //     //    snippet: {
  //     //      publishedAt: '2024-02-02T11:30:05Z',
  //     //      channelId: 'UCYi_OvOETYFdqTvZcYvcrLQ',
  //     //      title: 'Test Video Title',
  //     //      description: 'Test Video Description',
  //     //      thumbnails: { default: [Object], medium: [Object], high: [Object] },
  //     //      channelTitle: 'Ha Doan Manh',
  //     //      tags: [ 'test', 'video', 'youtube' ],
  //     //      categoryId: '22',
  //     //      liveBroadcastContent: 'none',
  //     //      localized: {
  //     //        title: 'Test Video Title',
  //     //        description: 'Test Video Description'
  //     //      }
  //     //    },
  //     //    status: {
  //     //      uploadStatus: 'uploaded',
  //     //      privacyStatus: 'private',
  //     //      license: 'youtube',
  //     //      embeddable: true,
  //     //      publicStatsViewable: true
  //     //    }
  //     //  }
  // }
}
