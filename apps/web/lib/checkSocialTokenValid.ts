type ResponseCheckSocialTokenValidApi = {
  valid: boolean;
  message?: string;
};

export async function checkSocialTokenValid() {
  try {
    const response = await fetch("/api/is-social-token-valid", {
      credentials: "include",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await response.json()) as ResponseCheckSocialTokenValidApi;
    return { response, data };
  } catch (err) {
    // Return a safe default and include error for debugging
    // so callers don't throw during module evaluation
    // eslint-disable-next-line no-console
    console.error("checkSocialTokenValid failed:", err);
    return {
      response: undefined,
      data: { valid: false, message: "request_failed" },
    };
  }
}
