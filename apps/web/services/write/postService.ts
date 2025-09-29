export async function getPostById(credentialId: any, id: number) {
  try {
    const response = await fetch(`/api/posts/getPostById?credentialId=${credentialId}&id=${id}`, {
      credentials: "include",
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("getPostById error", err);
    return null;
  }
}

export async function saveDraft(data: any) {
  try {
    const response = await fetch(`/api/posts/saveDraft`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("saveDraft error", err);
    return null;
  }
}

export async function schedulePost(id: number, scheduleDay: string) {
  try {
    const response = await fetch(`/api/posts/schedulePost`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, scheduleDay }),
    });
    return response.ok;
  } catch (err) {
    console.error("schedulePost error", err);
    return false;
  }
}

export async function savePluginData(id: any, pluginData: any) {
  try {
    const response = await fetch(`/api/posts/savePlugin`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, plugin: pluginData }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Error saving plugin data:", error?.message || response.statusText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("savePluginData error", err);
    return false;
  }
}

export async function publishPost(urlSocial: string, id: number) {
  try {
    const response = await fetch(`/api/integrations/${urlSocial}/post?id=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMessage = responseData?.message || responseData?.error || "Failed to publish post";
      return { ok: false, error: errorMessage };
    }
    if (responseData?.success === false) {
      const errorMessage = responseData?.error || responseData?.message || "Failed to publish post";
      return { ok: false, error: errorMessage };
    }
    return { ok: true, data: responseData };
  } catch (err) {
    console.error("publishPost error", err);
    return { ok: false, error: String(err) };
  }
}
