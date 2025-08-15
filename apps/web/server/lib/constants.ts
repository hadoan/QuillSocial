export const GOOGLE_API_CREDENTIALS = process.env.GOOGLE_API_CREDENTIALS || "{}";

const safeParse = (raw: string): any => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Invalid GOOGLE_API_CREDENTIALS JSON; Google OAuth disabled. Error:", (e as Error).message);
    return {};
  }
};

const parsedGoogleCreds = safeParse(GOOGLE_API_CREDENTIALS)?.web || {};
export const {
  client_id: GOOGLE_CLIENT_ID,
  client_secret: GOOGLE_CLIENT_SECRET,
} = parsedGoogleCreds;
export const GOOGLE_LOGIN_ENABLED = process.env.GOOGLE_LOGIN_ENABLED === "true";
export const IS_GOOGLE_LOGIN_ENABLED = true;
export const IS_SAML_LOGIN_ENABLED = false;
