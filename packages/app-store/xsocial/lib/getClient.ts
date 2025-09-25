import { getXAppKeys } from "./getXAppKeys";
import { xCredentialSchema } from "./xCredentialSchema";
import prisma from "@quillsocial/prisma";
import { TwitterApi } from "twitter-api-v2";

// const client = new Client(process.env.BEARER_TOKEN);

export const getClient = async (credentialId: number) => {
  const keys = await getXAppKeys();

  const credential = await prisma.credential.findUnique({
    where: {
      id: credentialId,
    },
  });
  if (!credential) {
    return { client: null, refreshedClient: null };
  }
  const typedCredential = xCredentialSchema.parse(credential.key);
  if (typedCredential?.token) {
    const client = new TwitterApi({
      clientId: keys.client_id,
      clientSecret: keys.client_secret,
    });
    const {
      client: refreshedClient,
      accessToken,
      refreshToken,
    } = await client.refreshOAuth2Token(typedCredential.token.refresh_token);
    // Use {refreshedClient}, and save {accessToken} and {refreshToken} in your storage to use them later
    typedCredential.token.access_token = accessToken;
    typedCredential.token.refresh_token = refreshToken ?? "-";
    credential.key = typedCredential;
    await prisma.credential.update({
      where: {
        id: credential.id,
      },
      data: {
        key: typedCredential,
      },
    });

    return { client, refreshedClient };
  } else {
    return { client: null, refreshedClient: null };
  }
};
