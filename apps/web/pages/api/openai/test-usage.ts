import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import {
  getUserUsageStats,
  logOpenAIUsage,
} from "@quillsocial/lib/openai-usage";
import { defaultResponder } from "@quillsocial/lib/server";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    // Get usage stats
    const stats = await getUserUsageStats(userId);
    return res.json(stats);
  }

  if (req.method === "POST") {
    // Test logging usage (for development only)
    try {
      const {
        prompt = "Test prompt",
        result = "Test result",
        tokens = 100,
      } = req.body;

      const loggedUsage = await logOpenAIUsage({
        userId,
        prompt,
        result,
        promptTokens: Math.floor(tokens * 0.3),
        completionTokens: Math.floor(tokens * 0.7),
        totalTokens: tokens,
        requestType: "test_request",
        apiEndpoint: "test-usage",
        model: "gpt-4o-mini",
      });

      return res.json({
        success: true,
        message: "Test usage logged successfully",
        loggedUsage,
      });
    } catch (error) {
      console.error("Error logging test usage:", error);
      return res.status(500).json({
        success: false,
        message: "Error logging test usage",
      });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}

export default defaultResponder(handler);
