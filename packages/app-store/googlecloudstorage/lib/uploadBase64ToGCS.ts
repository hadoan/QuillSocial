import { Storage } from "@google-cloud/storage";
import { v4 as uuidV4 } from "uuid";
import logger from "@quillsocial/lib/logger";

interface UploadBase64Result {
  success: boolean;
  uuid: string;
  fileName: string;
  ext: string;
  publicUrl: string;
  fileSize: number;
}

/**
 * Upload a base64 image to Google Cloud Storage
 * Returns a publicly accessible URL for use with Instagram Graph API
 *
 * @param base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param originalFileName - Original filename (optional, will extract extension)
 * @returns Upload result with public URL
 */
export const uploadBase64ToGCS = async (
  base64Image: string,
  originalFileName?: string
): Promise<UploadBase64Result> => {
  const bucketName = process.env.GCP_BUCKET_NAME || "quillsocial-files";

  logger.info(`[GCS] Starting base64 upload to bucket: ${bucketName}`);
  logger.info(`[GCS] GCP_STORAGE_SERVICE_ACCOUNT exists: ${!!process.env.GCP_STORAGE_SERVICE_ACCOUNT}`);
  logger.info(`[GCS] GCP_STORAGE_SERVICE_ACCOUNT length: ${process.env.GCP_STORAGE_SERVICE_ACCOUNT?.length}`);

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.GCP_STORAGE_SERVICE_ACCOUNT!);
    logger.info(`[GCS] Service account parsed successfully for project: ${serviceAccount.project_id}`);
  } catch (err: any) {
    logger.error(`[GCS] Failed to parse GCP_STORAGE_SERVICE_ACCOUNT:`, err.message);
    return {
      success: false,
      uuid: "",
      fileName: "",
      ext: "",
      publicUrl: "",
      fileSize: 0,
    };
  }

  const storage = new Storage({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });

  // Extract base64 data and determine file extension
  let base64Data: string;
  let ext: string;
  let mimeType: string;

  if (base64Image.startsWith('data:')) {
    // Extract mime type and base64 data from data URI
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      logger.error(`[GCS] Invalid base64 data URI format`);
      return {
        success: false,
        uuid: "",
        fileName: "",
        ext: "",
        publicUrl: "",
        fileSize: 0,
      };
    }
    mimeType = matches[1];
    base64Data = matches[2];

    // Determine extension from mime type
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    ext = mimeToExt[mimeType] || 'jpg';
  } else {
    // Plain base64 without data URI
    base64Data = base64Image;
    ext = originalFileName?.split('.').pop() || 'jpg';
    mimeType = `image/${ext}`;
  }

  logger.info(`[GCS] Detected image type: ${mimeType} (.${ext})`);

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');
  const fileSize = buffer.length;

  logger.info(`[GCS] Image size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  // Generate unique filename
  const thisUUID = uuidV4();
  const fileName = `instagram/${thisUUID}.${ext}`;

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    // Upload buffer with metadata
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          originalFileName: originalFileName || `image.${ext}`,
          uploadedAt: new Date().toISOString(),
          uploadedFor: 'instagram',
        }
      },
      public: true, // Make file publicly accessible
      validation: 'md5',
    });

    logger.info(`[GCS] ✅ Upload successful: ${fileName}`);

    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    logger.info(`[GCS] 🔗 Public URL: ${publicUrl}`);

    return {
      success: true,
      uuid: thisUUID,
      fileName: fileName,
      ext,
      publicUrl,
      fileSize,
    };
  } catch (err: any) {
    logger.error(`[GCS] ❌ Upload failed:`, err.message);
    logger.error(`[GCS] Error details:`, err);
    return {
      success: false,
      uuid: "",
      fileName: "",
      ext: "",
      publicUrl: "",
      fileSize: 0,
    };
  }
};

/**
 * Get public URL for an existing GCS file
 *
 * @param cloudFileId - UUID of the file
 * @param fileExt - File extension
 * @returns Public URL
 */
export const getGCSPublicUrl = (cloudFileId: string, fileExt: string): string => {
  const bucketName = process.env.GCP_BUCKET_NAME || "quillsocial-files";
  return `https://storage.googleapis.com/${bucketName}/instagram/${cloudFileId}.${fileExt}`;
};
