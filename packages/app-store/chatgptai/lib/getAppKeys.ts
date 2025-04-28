import { z } from "zod";

import { symmetricDecrypt } from "@quillsocial/lib/crypto";
import prisma from "@quillsocial/prisma";

const MY_APP_ENCRYPTION_KEY = process.env.MY_APP_ENCRYPTION_KEY || "";

export const getAppKeys = async (userId: number) => {
  const credential = await prisma.credential.findFirst({
    where: {
      userId,
      type: "chatgpt_ai",
      invalid: false,
    },
  });
  if (credential && credential.key) {
    const decrypted = symmetricDecrypt(
      credential.key.toString(),
      MY_APP_ENCRYPTION_KEY
    );
    const { organizationId, apiKey, secret } = JSON.parse(decrypted);
    return { organizationId, apiKey, secret };
  }
};
