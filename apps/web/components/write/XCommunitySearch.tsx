import { useState } from "react";
import { Button, Input, showToast } from "@quillsocial/ui";

type Props = {
  appId?: string | null;
  credentialId?: number | null | undefined;
  onSelect?: (community: { id?: string; name?: string } | null) => void;
};

const APP_TO_ENDPOINT: Record<string, string> = {
  "xconsumerkeys-social": "xconsumerkeyssocial",
  twitterv1social: "twitterv1social",
  xsocial: "xsocial",
  // variants used elsewhere in the codebase
  "twitterv1-social": "twitterv1social",
  "twitterv1_social": "twitterv1social",
};

export default function XCommunitySearch({ appId, credentialId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id?: string; name?: string } | null>(
    null
  );

  console.log("AppId:", appId);
  const shouldRender =
    !!appId &&
    Object.keys(APP_TO_ENDPOINT).includes(appId as string);

  if (!shouldRender) return null;

  const endpoint = APP_TO_ENDPOINT[appId as string];

  const doSearch = async () => {
    if (!credentialId) {
      showToast("No credential selected", "error");
      return;
    }
    if (!query || query.trim().length === 0) {
      showToast("Enter a community name to search", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/integrations/${endpoint}/searchCommunity?credentialId=${credentialId}&name=${encodeURIComponent(
          query
        )}`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        showToast(data?.error || data?.message || "Search failed", "error");
        setResult(null);
        onSelect?.(null);
      } else {
        const r = { id: data.id, name: data.name };
        setResult(r);
        onSelect?.(r);
        showToast("Found community", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Search failed", "error");
      setResult(null);
      onSelect?.(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter is pressed without Shift (i.e. submit), trigger search
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void doSearch();
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Community section with improved layout */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Community
        </label>

        {/* Search input with better alignment */}
        <div className="flex items-stretch gap-3">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search community by name"
              className="w-full h-10"
            />
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={doSearch}
              disabled={loading}
              className="h-10 px-4"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>


      {/* Search results with improved styling */}
      {result && (
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="text-sm font-medium text-gray-900">{result.name}</div>
          <div className="text-xs text-gray-500 mt-1">id: {result.id}</div>
        </div>
      )}
    </div>
  );
}
