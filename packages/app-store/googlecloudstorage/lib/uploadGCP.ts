import { Storage } from "@google-cloud/storage";
import { v4 as uuidV4 } from "uuid";

interface UploadResult {
  success: boolean;
  uuid: string;
  fileName: string;
  originFileName: string;
  ext: string;
}

export const uploadGCP = async (sourceFileName: string, filePath: string): Promise<UploadResult> => {
  const bucketName = process.env.GCP_BUCKET_NAME || "quillsocial-files";
  const generationMatchPrecondition = 0;
  const serviceAccount = JSON.parse(process.env.GCP_STORAGE_SERVICE_ACCOUNT!);

  const storage = new Storage({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });

  // Extract file extension
  const baseName = sourceFileName.split(/[\\/]/).pop() || "";
  const ext = baseName.slice(baseName.lastIndexOf(".") + 1);

  // Ensure valid file extension
  if (!ext) {
    return {
      success: false,
      uuid: "",
      fileName: "",
      originFileName: baseName,
      ext: ""
    };
  }

  const thisUUID = uuidV4();
  const fileName = `${thisUUID}.${ext}`;

  const options = {
    destination: fileName,
    // Set a generation-match precondition to avoid potential race conditions
    // and data corruptions. The request to upload is aborted if the object's
    // generation number does not match your precondition. For a destination
    // object that does not yet exist, set the ifGenerationMatch precondition to 0
    // If the destination object already exists in your bucket, set instead a
    // generation-match precondition using its generation number.
    preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
  };

  try {
    await storage.bucket(bucketName).upload(filePath, options);
  } catch (err) {
    console.error(err);
    return {
      success: false,
      uuid: "",
      fileName: "",
      originFileName: baseName,
      ext
    };
  }

  return {
    success: true,
    uuid: thisUUID,
    fileName: fileName,
    originFileName: baseName,
    ext
  };
};
