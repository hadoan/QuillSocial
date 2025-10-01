import { post } from "../lib/instagramManager";
import logger from "@quillsocial/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

//http://localhost:3000/api/integrations/instagramsocial/post?id={postId}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.info(`\n📨 [Instagram API] ========================================`);
  logger.info(`📨 [Instagram API] Incoming request to /api/integrations/instagramsocial/post`);
  logger.info(`📨 [Instagram API] Method: ${req.method}`);
  logger.info(`📨 [Instagram API] Query params:`, req.query);
  logger.info(`📨 [Instagram API] ========================================\n`);

  const userId = (req as any).session?.user?.id;

  if (!userId) {
    logger.error(`❌ [Instagram API] Unauthorized: No user session`);
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  logger.info(`✅ [Instagram API] User authenticated: ${userId}`);

  if (req.method === "POST") {
    const idQuery = req.query.id;
    logger.info(`📝 [Instagram API] Post ID from query: ${idQuery}`);

    if (idQuery && +idQuery > 0) {
      const id = +idQuery;
      logger.info(`✅ [Instagram API] Valid post ID: ${id}`);

      try {
        logger.info(`🚀 [Instagram API] Calling post() function...`);
        const result = await post(id);

        if (result) {
          logger.info(`✅ [Instagram API] Post successful!`);
          logger.info(`📊 [Instagram API] Result:`, JSON.stringify(result, null, 2));
          res.status(200).json({ success: true, result });
        } else {
          logger.error(`❌ [Instagram API] Post failed - result is falsy`);
          res.status(400).json({ success: false, error: "Failed to post to Instagram" });
        }
      } catch (error: any) {
        logger.error(`❌ [Instagram API] Exception caught:`);
        logger.error(`   Message:`, error.message);
        logger.error(`   Stack:`, error.stack);
        res.status(500).json({ success: false, error: error.message });
      }
    } else {
      logger.error(`❌ [Instagram API] Invalid post ID: ${idQuery}`);
      res.status(400).json({ success: false, error: "Invalid Id value" });
    }
  } else {
    logger.error(`❌ [Instagram API] Method not allowed: ${req.method}`);
    res.status(405).json({ message: "Method not allowed" });
  }

  logger.info(`\n📨 [Instagram API] Request completed\n`);
}
