import { useState } from "react";
import { Button, TextArea, showToast } from "@quillsocial/ui";

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

export default function Community({ appId, credentialId, onSelect }: Props) {
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

  return (
    <div className="m-3 rounded border bg-white p-3">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Community
      </label>
      <div className="flex gap-2">
        <TextArea
          value={query}
          onChange={(e: any) => setQuery(e.target.value)}
          placeholder="Search community by name"
          className="h-10"
        />
        <Button onClick={doSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      {result && (
        <div className="mt-2 rounded border p-2">
          <div className="text-sm font-medium">{result.name}</div>
          <div className="text-xs text-gray-500">id: {result.id}</div>
        </div>
      )}
    </div>
  );
}
