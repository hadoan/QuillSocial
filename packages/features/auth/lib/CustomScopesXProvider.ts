import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";
import { TwitterProfile } from "next-auth/providers/twitter";

export const CustomScopesXProvider = (
  config: Partial<OAuthUserConfig<TwitterProfile>>
): OAuthConfig<TwitterProfile> => ({
  id: "twitter",
  name: "Twitter",
  version: "2.0",
  type: "oauth",
  authorization: {
    url: "https://twitter.com/i/oauth2/authorize",
    params: { scope: "users.read tweet.read tweet.write offline.access" },
  },
  token: {
    url: "https://api.twitter.com/2/oauth2/token",
    // TODO: Remove this
    async request({ client, params, checks, provider }) {
      const response = await client.oauthCallback(
        provider.callbackUrl,
        params,
        checks,
        {
          exchangeBody: { client_id: config.clientId },
        }
      );
      return { tokens: response };
    },
  },
  userinfo: {
    url: "https://api.twitter.com/2/users/me",
    params: { "user.fields": "profile_image_url" },
  },
  profile: (profile: TwitterProfile) => ({
    id: profile.data.id as any,
    name: profile.data.name,
    // NOTE: E-mail is currently unsupported by OAuth 2 Twitter.
    email: null,
    image: profile.data.profile_image_url,
  }),
  checks: ["pkce", "state"],
  style: { logo: "/twitter.svg", bg: "#1da1f2", text: "#fff" },
  ...config,
});
