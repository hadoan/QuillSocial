// import { symmetricDecrypt } from "@quillsocial/lib/crypto";
// import prisma from "@quillsocial/prisma";
// import { z } from "zod";
import { OPENAI_ORG_ID, OPENAI_API_KEY } from "@quillsocial/lib/constants";

// const MY_APP_ENCRYPTION_KEY = process.env.MY_APP_ENCRYPTION_KEY || "";

// export const getAppKeys = async (userId: number) => {
//   const credential = await prisma.credential.findFirst({
//     where: {
//       userId,
//       type: "chatgpt_ai",
//       invalid: false,
//     },
//   });
//   if (credential && credential.key) {
//     const decrypted = symmetricDecrypt(
//       credential.key.toString(),
//       MY_APP_ENCRYPTION_KEY
//     );
//     const { organizationId, apiKey, secret } = JSON.parse(decrypted);
//     return { organizationId, apiKey, secret };
//   }
// };

// Use API keys from .env instead of DB
export const getEnvAppKeys = () => {
  return {
    organizationId: OPENAI_ORG_ID,
    apiKey: OPENAI_API_KEY,
  };
};
