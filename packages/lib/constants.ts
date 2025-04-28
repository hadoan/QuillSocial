export const WEBAPP_URL =
  process.env.NEXT_PUBLIC_WEBAPP_URL || "http://localhost:3000";
/** @deprecated use `WEBAPP_URL` */
export const BASE_URL = WEBAPP_URL;

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "QuillAI";
export const SUPPORT_MAIL_ADDRESS =
  process.env.NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS || "help@quillsocial.co";
export const COMPANY_NAME =
  process.env.NEXT_PUBLIC_COMPANY_NAME || "QuillAI, Inc.";
export const SENDER_ID = process.env.NEXT_PUBLIC_SENDER_ID || "QuillAI";
export const SENDER_NAME =
  process.env.NEXT_PUBLIC_SENDGRID_SENDER_NAME || "QuillAI";

// This is the URL from which all Quill Links and their assets are served.
// Use website URL to make links shorter(quillsocial.co and not app.quillsocial.co)
// As website isn't setup for preview environments, use the webapp url instead
export const MY_APP_URL = WEBAPP_URL;

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const TRIAL_LIMIT_DAYS = 14;
/** @deprecated use `WEBAPP_URL` */
export const NEXT_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_WEBAPP_URL || `https://${process.env.VERCEL_URL}`;
export const LOGO = "/quillsocial-logo-white-word.svg";
export const LOGO_ICON = "/quill-com-icon-white.svg";
export const FAVICON_16 = "/favicon-16x16.png";
export const FAVICON_32 = "/favicon-32x32.png";
export const APPLE_TOUCH_ICON = "/apple-touch-icon.png";
export const MSTILE_ICON = "/mstile-150x150.png";
export const ANDROID_CHROME_ICON_192 = "/android-chrome-192x192.png";
export const ANDROID_CHROME_ICON_256 = "/android-chrome-256x256.png";
export const ROADMAP = "https://quillsocial.co/roadmap";
export const DESKTOP_APP_LINK = "https://quillsocial.co/download";
export const JOIN_SLACK = "https://quillsocial.co/slack";
export const POWERED_BY_URL = `${WEBAPP_URL}/?utm_source=embed&utm_medium=powered-by-button`;
export const DOCS_URL = "https://quillsocial.co/docs";
export const DEVELOPER_DOCS = "https://developer.quillsocial.co";
export const SEO_IMG_DEFAULT = `${WEBAPP_URL}/og-image.png`;
export const SEO_IMG_OGIMG = `${MY_APP_URL}/_next/image?w=1200&q=100&url=${encodeURIComponent(
  "/api/social/og/image"
)}`;
export const SEO_IMG_OGIMG_VIDEO = `${WEBAPP_URL}/video-og-image.png`;
export const IS_STRIPE_ENABLED = !!(
  process.env.STRIPE_CLIENT_ID &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY &&
  process.env.STRIPE_PRIVATE_KEY
);
/** Self hosted shouldn't checkout when creating teams unless required */
export const IS_TEAM_BILLING_ENABLED = false;
export const FULL_NAME_LENGTH_MAX_LIMIT = 50;
export const MINUTES_TO_BOOK = process.env.NEXT_PUBLIC_MINUTES_TO_BOOK || "5";

// Needed for orgs
export const ALLOWED_HOSTNAMES = JSON.parse(
  `[${process.env.ALLOWED_HOSTNAMES || ""}]`
) as string[];
export const RESERVED_SUBDOMAINS = JSON.parse(
  `[${process.env.RESERVED_SUBDOMAINS || ""}]`
) as string[];

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_ORG_ID = process.env.OPENAI_ORG_ID;

export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
export const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
export const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
export const AZURE_OPENAI_VERSION = process.env.AZURE_OPENAI_VERSION;
export const AZURE_OPENAI_DEPLOYMENT_ID =
  process.env.AZURE_OPENAI_DEPLOYMENT_ID!;

export const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
export const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

export const LINKEDIN_SCOPES =
  "rw_ads rw_organization_admin w_organization_social profile email w_member_social openid";

export const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
export const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
export const TWITTER_APP_ID = "twitterv1-social";
export const IS_SELF_HOSTED = !(
  new URL(WEBAPP_URL).hostname.endsWith(".app.quillsocial.co") ||
  new URL(WEBAPP_URL).hostname.endsWith(".quillsocial.co")
);
