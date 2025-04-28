type ResponseCheckGoogleTokenValidApi = {
  valid: boolean;
  message?: string;
};

export async function checkGoogleTokenValid() {
  const response = await fetch("/api/is-google-token-valid", {
    credentials: "include",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as ResponseCheckGoogleTokenValidApi;
  return { response, data };
}
