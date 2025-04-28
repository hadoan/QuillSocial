import { IdentityProvider } from "@quillsocial/prisma/enums";

export const identityProviderNameMap: { [key in IdentityProvider]: string } = {
  [IdentityProvider.DB]: "Db",
  [IdentityProvider.GOOGLE]: "Google",
  [IdentityProvider.SAML]: "SAML",
  [IdentityProvider.TWITTER]: "Twitter",
  [IdentityProvider.LINKEDIN]: "LinkedIn",
};
