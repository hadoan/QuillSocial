import { prisma } from "@quillsocial/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export interface OpenAIUsageData {
  userId: number;
  teamId?: number;
  prompt: string;
  result: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requestType: string;
  apiEndpoint?: string;
  model?: string;
}

/**
 * Log OpenAI API usage to the database
 */
export async function logOpenAIUsage(data: OpenAIUsageData) {
  try {
    const usage = await prisma.openAIUsage.create({
      data: {
        ...data,
        model: data.model || "gpt-4o-mini",
      },
    });
    return usage;
  } catch (error) {
    console.error("Error logging OpenAI usage:", error);
    throw error;
  }
}

/**
 * Get total token usage for a user in the current month
 */
export async function getUserMonthlyTokenUsage(userId: number): Promise<number> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  try {
    const result = await prisma.openAIUsage.aggregate({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        totalTokens: true,
      },
    });

    return result._sum.totalTokens || 0;
  } catch (error) {
    console.error("Error getting monthly token usage:", error);
    return 0;
  }
}

/**
 * Check if user is LTD and get their billing info
 */
export async function getUserBillingInfo(userId: number) {
  try {
    // First get user's team info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teams: {
          include: {
            team: {
              include: {
                billings: true,
              },
            },
          },
        },
        Billings: true,
      },
    });

    if (!user) {
      return { isLTD: false, tokenLimit: 0 };
    }

    // Check user's direct billing
    const userBilling = user.Billings.find(
      (billing) => billing.paymentId === "LTD" || billing.type === "LTD"
    );

    if (userBilling) {
      return {
        isLTD: true,
        tokenLimit: 100000, // 100k tokens per month for LTD users
        billing: userBilling,
      };
    }

    // Check team billing
    for (const membership of user.teams) {
      const teamBilling = membership.team.billings.find(
        (billing) => billing.paymentId === "LTD" || billing.type === "LTD"
      );
      if (teamBilling) {
        return {
          isLTD: true,
          tokenLimit: 100000, // 100k tokens per month for LTD users
          billing: teamBilling,
        };
      }
    }

    return { isLTD: false, tokenLimit: 0 };
  } catch (error) {
    console.error("Error getting user billing info:", error);
    return { isLTD: false, tokenLimit: 0 };
  }
}

/**
 * Check if user can make OpenAI request (within token limits)
 */
export async function canUserMakeOpenAIRequest(
  userId: number,
  estimatedTokens: number = 1000
): Promise<{ allowed: boolean; reason?: string; currentUsage?: number; limit?: number }> {
  try {
    const billingInfo = await getUserBillingInfo(userId);
    
    // Non-LTD users have unlimited access (for now)
    if (!billingInfo.isLTD) {
      return { allowed: true };
    }

    const currentUsage = await getUserMonthlyTokenUsage(userId);
    const limit = billingInfo.tokenLimit;

    if (currentUsage + estimatedTokens > limit) {
      return {
        allowed: false,
        reason: `Monthly token limit exceeded. Used: ${currentUsage}/${limit} tokens`,
        currentUsage,
        limit,
      };
    }

    return {
      allowed: true,
      currentUsage,
      limit,
    };
  } catch (error) {
    console.error("Error checking user token limits:", error);
    return {
      allowed: false,
      reason: "Error checking token limits",
    };
  }
}

/**
 * Get user's OpenAI usage history
 */
export async function getUserOpenAIUsageHistory(
  userId: number,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const history = await prisma.openAIUsage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return history;
  } catch (error) {
    console.error("Error getting usage history:", error);
    return [];
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: number) {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [monthlyUsage, totalUsage, monthlyRequests] = await Promise.all([
      // Monthly token usage
      prisma.openAIUsage.aggregate({
        where: {
          userId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          totalTokens: true,
        },
      }),
      
      // Total lifetime usage
      prisma.openAIUsage.aggregate({
        where: { userId },
        _sum: {
          totalTokens: true,
        },
      }),
      
      // Monthly request count
      prisma.openAIUsage.count({
        where: {
          userId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
    ]);

    const billingInfo = await getUserBillingInfo(userId);

    return {
      monthlyTokens: monthlyUsage._sum.totalTokens || 0,
      totalTokens: totalUsage._sum.totalTokens || 0,
      monthlyRequests,
      isLTD: billingInfo.isLTD,
      tokenLimit: billingInfo.tokenLimit,
      remainingTokens: billingInfo.isLTD 
        ? Math.max(0, billingInfo.tokenLimit - (monthlyUsage._sum.totalTokens || 0))
        : null,
    };
  } catch (error) {
    console.error("Error getting usage stats:", error);
    return {
      monthlyTokens: 0,
      totalTokens: 0,
      monthlyRequests: 0,
      isLTD: false,
      tokenLimit: 0,
      remainingTokens: null,
    };
  }
}
