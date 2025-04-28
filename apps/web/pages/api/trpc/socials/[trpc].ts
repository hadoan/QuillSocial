import { createNextApiHandler } from "@quillsocial/trpc/server/createNextApiHandler";
import { socialsRouter } from "@quillsocial/trpc/server/routers/viewer/socials/_router";

export default createNextApiHandler(socialsRouter);
