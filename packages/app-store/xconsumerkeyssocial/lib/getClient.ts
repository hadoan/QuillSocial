import prisma from "@quillsocial/prisma";
import { symmetricDecrypt } from "@quillsocial/lib/crypto";
import { TwitterApi } from "twitter-api-v2";
import { xconsumerkeysCredentialSchema } from "./credentialSchema";

export const getXConsumerKeysClient = async (credentialId: number) => {
  const credential = await prisma.credential.findUnique({
    where: {
      id: credentialId,
    },
  });

  if (!credential) {
    return { client: null };
  }

  try {
    // Decrypt the stored API keys
    const decryptedKey = symmetricDecrypt(
      credential.key as string,
      process.env.MY_APP_ENCRYPTION_KEY || ""
    );

    const parsedCredential = xconsumerkeysCredentialSchema.parse(JSON.parse(decryptedKey));

    // Create Twitter client using OAuth 1.0a with Consumer Keys
    const client = new TwitterApi({
      appKey: parsedCredential.apiKey,
      appSecret: parsedCredential.secret,
      // For posting with OAuth 1.0a, we need user access tokens
      // But since this is just consumer keys, we'll need to handle this differently
    });

    return { client, credentials: parsedCredential };
  } catch (error) {
    console.error("Error creating X client with consumer keys:", error);
    return { client: null };
  }
};
