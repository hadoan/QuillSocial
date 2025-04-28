import { createNextApiHandler } from "@quillsocial/trpc/server/createNextApiHandler";
import { loggedInViewerRouter } from "@quillsocial/trpc/server/routers/loggedInViewer/_router";

export default createNextApiHandler(loggedInViewerRouter);
