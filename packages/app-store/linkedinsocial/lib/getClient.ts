import prisma from "@quillsocial/prisma";

// const client = new Client(process.env.BEARER_TOKEN);
export const getClient = async (credentialId: number) => {
  const credential = await prisma.credential.findUnique({
    where: {
      id: credentialId,
    },
  });

  let accessToken: string | undefined;
  // accessToken = await refreshAccessToken(accessToken,client_id,client_secret,client_id);
  if (credential && typeof credential.key === "object" && credential.key !== null) {
    accessToken = (credential.key as Record<string, unknown>).access_token as string | undefined;
    if (!accessToken && (credential.key as any).token !== null) {
      accessToken = ((credential.key as any).token as Record<string, unknown>).access_token as
        | string
        | undefined;
    }
  }
  if (accessToken) return accessToken;
  else return false;
};
