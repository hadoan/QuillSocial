import { HttpError } from "@quillsocial/lib/http-error";
import type { NextApiRequest } from "next";

export default function checkSession(req: NextApiRequest) {
  if (!req.session?.user?.id) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized" });
  }
  return req.session;
}
