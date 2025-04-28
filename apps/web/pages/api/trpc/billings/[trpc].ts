import { createNextApiHandler } from "@quillsocial/trpc/server/createNextApiHandler";
import { billingsRouter } from "@quillsocial/trpc/server/routers/viewer/billings/_router";

export default createNextApiHandler(billingsRouter);
