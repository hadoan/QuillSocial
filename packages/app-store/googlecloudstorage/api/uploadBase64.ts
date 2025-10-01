import { uploadBase64ToGCS } from "../lib/uploadBase64ToGCS";
import { getUserFromToken } from "@quillsocial/lib/teams/getUserFromToken";
import prisma from "@quillsocial/prisma";
import logger from "@quillsocial/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to upload base64 images to Google Cloud Storage
 * Used primarily for Instagram posts which require publicly accessible URLs
 *
 * POST /api/integrations/googlecloudstorage/uploadBase64
 * Body: { base64Image: string, originalFileName?: string }
 * Returns: { id, cloudFileId, publicUrl, fileName, fileExt, fileSize }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  logger.info(`[GCS Upload API] Incoming base64 upload request`);

  // Authenticate user
  const user = await getUserFromToken(req, res);
  if (!user) {
    logger.error(`[GCS Upload API] Unauthorized request`);
    return res.status(401).json({ message: "Unauthorized" });
  }

  logger.info(`[GCS Upload API] User authenticated: ${user.id}`);

  const { base64Image, originalFileName } = req.body;

  // Validate request
  if (!base64Image || typeof base64Image !== 'string') {
    logger.error(`[GCS Upload API] Invalid base64Image in request body`);
    return res.status(400).json({ message: "base64Image is required and must be a string" });
  }

  if (base64Image.length > 10 * 1024 * 1024) {
    logger.error(`[GCS Upload API] Image too large: ${(base64Image.length / 1024 / 1024).toFixed(2)} MB`);
    return res.status(400).json({ message: "Image too large (max 10MB)" });
  }

  logger.info(`[GCS Upload API] Uploading image for user ${user.id}`);

  try {
    // Upload to GCS
    const gcpResult = await uploadBase64ToGCS(base64Image, originalFileName);

    if (!gcpResult.success) {
      logger.error(`[GCS Upload API] Upload to GCS failed`);
      return res.status(500).json({ message: "Could not upload file to GCS" });
    }

    logger.info(`[GCS Upload API] ✅ GCS upload successful: ${gcpResult.fileName}`);
    logger.info(`[GCS Upload API] Creating CloudFile record in database...`);

    // Create CloudFile record in database
    const cloudFile = await prisma.cloudFile.create({
      data: {
        cloudFileId: gcpResult.uuid,
        fileExt: gcpResult.ext,
        fileName: originalFileName || `image.${gcpResult.ext}`,
        fileSize: BigInt(gcpResult.fileSize),
      },
    });

    logger.info(`[GCS Upload API] ✅ CloudFile created with ID: ${cloudFile.id}`);

    // Return response with public URL
    const response = {
      id: cloudFile.id,
      cloudFileId: cloudFile.cloudFileId,
      publicUrl: gcpResult.publicUrl,
      fileName: cloudFile.fileName,
      fileExt: cloudFile.fileExt,
      fileSize: gcpResult.fileSize,
    };

    logger.info(`[GCS Upload API] 🎉 Upload complete!`);
    logger.info(`[GCS Upload API] Public URL: ${gcpResult.publicUrl}`);

    return res.status(201).json(response);
  } catch (error: any) {
    logger.error(`[GCS Upload API] ❌ Unexpected error:`, error.message);
    logger.error(`[GCS Upload API] Error stack:`, error.stack);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow up to 10MB for base64 images
    },
  },
};
