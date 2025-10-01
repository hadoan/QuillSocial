import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Input, showToast } from "@quillsocial/ui";

type Props = {
  appId?: string | null;
  credentialId?: number | null | undefined;
  onSelect?: (community: { id?: string; name?: string } | null) => void;
  selectedCommunity?: { id?: string; name?: string } | null;
};

const APP_TO_ENDPOINT: Record<string, string> = {
  "xconsumerkeys-social": "xconsumerkeyssocial",
  "xconsumerkeys_social": "xconsumerkeyssocial",
  twitterv1social: "twitterv1social",
  xsocial: "xsocial",
  // variants used elsewhere in the codebase
  "twitterv1-social": "twitterv1social",
  "twitterv1_social": "twitterv1social",
};

export default function XCommunitySearch({ appId, credentialId, onSelect, selectedCommunity }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id?: string; name?: string } | null>(
    selectedCommunity || null
  );

  const router = useRouter();
  const { id } = router.query;
  const postId = typeof id === "string" ? parseInt(id, 10) : 0;

  // Load cached community from localStorage for new posts (id === 0)
  useEffect(() => {
    // Only auto-apply cached community for new posts when this component is intended to render
    // (i.e. appId maps to a known X/Twitter endpoint). This prevents other apps (e.g. Threads)
    // from receiving the cached community selection.
    const shouldApplyCache =
      postId === 0 && !selectedCommunity && typeof window !== "undefined" &&
      !!appId && Object.keys(APP_TO_ENDPOINT).includes(appId as string);

    if (shouldApplyCache) {
      const cached = localStorage.getItem("xcommunity_search_cache");
      if (cached) {
        try {
          const cachedCommunity = JSON.parse(cached);
          setResult(cachedCommunity);
          onSelect?.(cachedCommunity);
        } catch (error) {
          console.error("Failed to parse cached community:", error);
          localStorage.removeItem("xcommunity_search_cache");
        }
      }
    }
  }, [postId, selectedCommunity, onSelect]);

  // Update result when selectedCommunity prop changes (for existing posts)
  useEffect(() => {
    if (selectedCommunity) {
      setResult(selectedCommunity);
    }
  }, [selectedCommunity]);

  const shouldRender =
    !!appId &&
    Object.keys(APP_TO_ENDPOINT).includes(appId as string);

  if (!shouldRender) {
    return null;
  }

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

        // Cache the successful search result for new posts (id === 0)
        if (postId === 0 && typeof window !== "undefined") {
          localStorage.setItem("xcommunity_search_cache", JSON.stringify(r));
        }

        showToast("Found community", "success");
      }
    } catch (err) {
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
          {!credentialId && (
            <span className="ml-2 text-xs text-gray-400">(No credential selected)</span>
          )}
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
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">{result.name}</div>
              <div className="text-xs text-gray-500 mt-1">id: {result.id}</div>
            </div>
            <Button
              onClick={() => {
                setResult(null);
                onSelect?.(null);

                // Clear localStorage cache for new posts (id === 0)
                if (postId === 0 && typeof window !== "undefined") {
                  localStorage.removeItem("xcommunity_search_cache");
                }
              }}
              className="text-xs px-2 py-1 h-auto bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
