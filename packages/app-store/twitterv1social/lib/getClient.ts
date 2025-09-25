import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { getXAppKeys } from "./getXAppKeys";
import { xCredentialSchema } from "./xCredentialSchema";
import prisma from "@quillsocial/prisma";
import { TwitterApi } from "twitter-api-v2";

// const client = new Client(process.env.BEARER_TOKEN);
let appKey = "";
let appSecret = "";
export const getClient = async (credentialId: number) => {
  const appKeys = await getAppKeysFromSlug("twitterv1-social");
  if (typeof appKeys.appKey === "string") appKey = appKeys.appKey;
  if (typeof appKeys.appSecret === "string") appSecret = appKeys.appSecret;

  const credential = await prisma.credential.findUnique({
    where: {
      id: credentialId,
    },
  });
  if (!credential) {
    return { clientV1: null };
  }
  const typedCredential = xCredentialSchema.parse(credential.key);
  if (typedCredential?.token) {
    var clientV1 = new TwitterApi({
      appKey,
      appSecret,
      accessToken: typedCredential.token.accessToken,
      accessSecret: typedCredential.token.accessSecret,
    });
    return { clientV1 };
  } else {
    return { clientV1: null };
  }
};
