import { createNextApiHandler } from "@quillsocial/trpc/server/createNextApiHandler";
import { appsRouter } from "@quillsocial/trpc/server/routers/viewer/apps/_router";

export default createNextApiHandler(appsRouter);
