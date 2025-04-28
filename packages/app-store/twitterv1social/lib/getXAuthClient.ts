// import { WEBAPP_URL } from "@quillsocial/lib/constants";
// import { auth, Client } from "twitter-api-sdk";

// let authClient: auth.OAuth2User | undefined = undefined;
// export const getXAuthClient = (client_id: string, client_secret: string, token?: any) => {

//   const callback = WEBAPP_URL + "/api/integrations/xsocial/callback";
//   const authClient = new auth.OAuth2User({
//     client_id,
//     client_secret,
//     callback,
//     scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
//     token
//   });
//   const authUrl = authClient?.generateAuthURL({
//     state: "my-state",
//     code_challenge_method: "s256"
//   });
//   return { authClient, authUrl };
// };
