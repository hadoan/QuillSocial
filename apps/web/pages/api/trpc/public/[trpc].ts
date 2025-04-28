import { createNextApiHandler } from "@quillsocial/trpc/server/createNextApiHandler";
import { publicViewerRouter } from "@quillsocial/trpc/server/routers/publicViewer/_router";

export default createNextApiHandler(publicViewerRouter, true);
