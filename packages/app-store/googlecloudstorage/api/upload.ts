import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { uploadGCP } from "../lib/uploadGCP";
import prisma from "@quillsocial/prisma";
import { getUserFromToken } from "@quillsocial/lib/teams/getUserFromToken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const form = formidable();

    const user = await getUserFromToken(req, res);
    if (!user) {
      return res.status(401).end();
    }

    form.parse(req, async (err, _fields, files) => {
      if (err) throw err;
      const uploadedDocument: any = files["cloudFiles"];

      if (!uploadedDocument || uploadedDocument.length == 0) {
        return res.status(400).json({ message: "No files to upload" });
      }
      const title = uploadedDocument[0].originalFilename;
      const path = uploadedDocument[0].filepath;

      const gcpResult = await uploadGCP(title, path);
      if (!gcpResult.success) {
        return res
          .status(400)
          .json({ message: "Could not upload file to GCP" });
      }
      const cloudFile = await prisma.cloudFile.create({
        data: {
          cloudFileId: gcpResult.uuid,
          fileExt: gcpResult.ext,
          fileName: gcpResult.originFileName,
          fileSize:
            !uploadedDocument || uploadedDocument.length == 0
              ? undefined
              : uploadedDocument[0].size,
        },
      });
      return res.status(201).send({
        ...cloudFile,
        fileSize:
          !uploadedDocument || uploadedDocument.length == 0
            ? undefined
            : uploadedDocument[0].size,
      });
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
