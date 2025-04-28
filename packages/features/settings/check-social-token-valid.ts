import prisma from "@quillsocial/prisma";
import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import type { NextApiRequest, NextApiResponse } from "next";

type Response = {
  valid: boolean;
  message?: string;
};
const typeValues = ["linkedin_social", "x_social", "facebook_social"];

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== "GET") {
    // Handle other HTTP methods if needed
    return res.status(405).json({ valid: false, message: "Method not allowed" });
  }
  const session = await getServerSession({ req, res });
  /* To mimic API behavior and comply with types */

  const userId = session?.user?.id || -1;
  if (!userId && userId <= 0) {
    return res.status(405).json({ valid: false, message: "User Not allowed" });
  }

  const credential = await prisma.credential.findFirst({
    where: {
      userId,
      type: {
        in: typeValues,
      },
    },
  });
  if (!credential) {
    return res.status(200).json({ valid: false });
  } else {
    return res.status(200).json({ valid: true });
  }
}
