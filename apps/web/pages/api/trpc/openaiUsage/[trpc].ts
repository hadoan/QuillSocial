import { createNextApiHandler } from "@quillsocial/trpc/server/createNextApiHandler";
import { openaiUsageRouter } from "@quillsocial/trpc/server/routers/viewer/openaiUsage";

export default createNextApiHandler(openaiUsageRouter);
