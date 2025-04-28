import perfMiddleware from "../middlewares/perfMiddleware";
import { isAdminMiddleware, isAuthed } from "../middlewares/sessionMiddleware";
import { procedure } from "../trpc";
import publicProcedure from "./publicProcedure";

const authedProcedure = procedure.use(perfMiddleware).use(isAuthed);
export const authedAdminProcedure = publicProcedure.use(isAdminMiddleware);

export default authedProcedure;
