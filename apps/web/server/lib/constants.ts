export const GOOGLE_API_CREDENTIALS =
  process.env.GOOGLE_API_CREDENTIALS || "{}";
export const {
  client_id: GOOGLE_CLIENT_ID,
  client_secret: GOOGLE_CLIENT_SECRET,
} = JSON.parse(GOOGLE_API_CREDENTIALS)?.web || {};
export const GOOGLE_LOGIN_ENABLED = process.env.GOOGLE_LOGIN_ENABLED === "true";
export const IS_GOOGLE_LOGIN_ENABLED = true;
export const IS_SAML_LOGIN_ENABLED = false;
