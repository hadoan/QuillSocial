import { createNextApiHandler } from "@quillsocial/trpc/server/createNextApiHandler";
import { viewerTeamsRouter } from "@quillsocial/trpc/server/routers/viewer/teams/_router";

export default createNextApiHandler(viewerTeamsRouter);
