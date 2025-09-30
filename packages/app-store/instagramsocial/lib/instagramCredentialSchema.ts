import { z } from "zod";

export const instagramCredentialSchema = z.object({
  access_token: z.string(),
  expires_in: z.number().optional(),
  token_type: z.literal("bearer").optional(),
});

export const instagramAuthTokenSchema = z.object({
  refreshToken: z.string(),
  expiresIn: z.number(),
  accessToken: z.string(),
  id: z.string(),
  name: z.string(),
  picture: z.string(),
  username: z.string(),
});

export const instagramPageInfoSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  name: z.string(),
  username: z.string().optional(),
  profile_picture_url: z.string().optional(),
  access_token: z.string(),
});
