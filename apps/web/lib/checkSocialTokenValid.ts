type ResponseCheckSocialTokenValidApi = {
    valid: boolean;
    message?: string;
};

export async function checkSocialTokenValid() {
    const response = await fetch("/api/is-social-token-valid", {
        credentials: "include",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = (await response.json()) as ResponseCheckSocialTokenValidApi;
    return { response, data };
}
