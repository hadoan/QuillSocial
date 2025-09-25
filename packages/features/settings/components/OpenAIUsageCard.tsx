import { trpc } from "@quillsocial/trpc/react";
import { Badge, Button } from "@quillsocial/ui";
import React from "react";

export const OpenAIUsageCard: React.FC = () => {
  const { data: stats, isLoading } =
    trpc.viewer.openaiUsage.getUsageStats.useQuery();

  if (isLoading)
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold">OpenAI Usage</h4>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );

  if (!stats)
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold">OpenAI Usage</h4>
        <p className="text-sm text-gray-500">No usage data available</p>
      </div>
    );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">OpenAI Usage</h4>
          <p className="text-sm text-gray-500">This month</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {stats.monthlyTokens.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">tokens</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {stats.isLTD && stats.tokenLimit ? (
          <Badge variant="gray">
            {Math.round((stats.monthlyTokens / stats.tokenLimit) * 100)}% of
            limit
          </Badge>
        ) : (
          <Badge variant="green">Unlimited</Badge>
        )}

        <Button href="/settings/billing/ai-usage">View details</Button>
      </div>
    </div>
  );
};

export default OpenAIUsageCard;
