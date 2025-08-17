import { useState } from "react";
import { trpc } from "@quillsocial/trpc/react";
import { Badge, Button, Alert } from "@quillsocial/ui";

export function OpenAIUsageDashboard() {
  const [showHistory, setShowHistory] = useState(false);

  const { data: stats, isLoading: isStatsLoading } = trpc.viewer.openaiUsage.getUsageStats.useQuery();
  const { data: history, isLoading: isHistoryLoading } = trpc.viewer.openaiUsage.getUsageHistory.useQuery(
    { limit: 20, offset: 0 },
    { enabled: showHistory }
  );

  if (isStatsLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">OpenAI Usage</h3>
        <p className="text-gray-600">Loading your usage statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">OpenAI Usage</h3>
        <p className="text-gray-600">Unable to load usage statistics</p>
      </div>
    );
  }

  const usagePercentage = stats.isLTD && stats.tokenLimit
    ? Math.round((stats.monthlyTokens / stats.tokenLimit) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">OpenAI Usage Statistics</h3>
          <p className="text-gray-600">Your AI content generation usage for this month</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Monthly Usage */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                This Month
              </p>
              <p className="text-2xl font-bold">
                {stats.monthlyTokens.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">tokens used</p>
            </div>

            {/* Total Usage */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Total Lifetime
              </p>
              <p className="text-2xl font-bold">
                {stats.totalTokens.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">tokens used</p>
            </div>

            {/* Monthly Requests */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Requests This Month
              </p>
              <p className="text-2xl font-bold">{stats.monthlyRequests}</p>
              <p className="text-xs text-gray-500">API calls</p>
            </div>
          </div>

          {/* LTD User Limit Display */}
          {stats.isLTD && stats.tokenLimit && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Monthly Limit</p>
                  <Badge variant={usagePercentage > 90 ? "red" : usagePercentage > 70 ? "orange" : "green"}>
                    {usagePercentage}% used
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usagePercentage > 90
                        ? "bg-red-500"
                        : usagePercentage > 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {stats.remainingTokens?.toLocaleString()} tokens remaining of{" "}
                  {stats.tokenLimit.toLocaleString()}
                </p>
              </div>

              {usagePercentage > 90 && (
                <Alert
                  severity="warning"
                  title="Token Limit Warning"
                  message="You're approaching your monthly token limit. Consider upgrading your plan for unlimited access."
                />
              )}
            </>
          )}

          {!stats.isLTD && (
            <div className="space-y-2">
              <Badge variant="green">Unlimited Usage</Badge>
              <p className="text-xs text-gray-500">
                You have unlimited access to AI content generation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Usage History</h3>
              <p className="text-gray-600">Recent AI content generation requests</p>
            </div>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              disabled={isHistoryLoading}
            >
              {showHistory ? "Hide" : "Show"} History
            </Button>
          </div>
        </div>

        {showHistory && (
          <div>
            {isHistoryLoading ? (
              <p className="text-gray-500">Loading history...</p>
            ) : history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="gray">{entry.requestType}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Request:</p>
                      <p className="text-xs text-gray-500 truncate">
                        {entry.prompt.substring(0, 100)}
                        {entry.prompt.length > 100 && "..."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Tokens: {entry.totalTokens}</span>
                      <span>Model: {entry.model}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No usage history found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
