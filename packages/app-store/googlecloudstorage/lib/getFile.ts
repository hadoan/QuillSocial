import { Storage } from "@google-cloud/storage";

export async function getFile(videoFileName: string) {
  const bucketName = process.env.GCP_BUCKET_NAME || "quillsocial-files";
  const serviceAccount = JSON.parse(process.env.GCP_STORAGE_SERVICE_ACCOUNT!);

  const storage = new Storage({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });

  const bucket = storage.bucket(bucketName);
  const file = bucket.file((videoFileName as string)!);

  // Generate a signed URL valid for 5 minutes
  const signedUrl = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes in milliseconds
  });
  return signedUrl && signedUrl.length > 0 ? signedUrl[0] : undefined;
}
