import type { RouterOutputs } from "@quillsocial/trpc/react";
import type { ButtonProps } from "@quillsocial/ui";
import type React from "react";
import type { z } from "zod";

export type IntegrationOAuthCallbackState = {
  returnTo: string;
  installGoogleVideo?: boolean;
  onErrorReturnTo?: string;
  fromApp?: boolean;

  teamId?: number;
};

type AppScript = { attrs?: Record<string, string> } & {
  src?: string;
  content?: string;
};

export type Tag = {
  scripts: AppScript[];
};

export interface InstallAppButtonProps {
  render: (
    renderProps: ButtonProps & {
      /** Tells that the default render component should be used */
      useDefaultComponent?: boolean;
    }
  ) => JSX.Element;
  onChanged?: () => unknown;
  disableInstall?: boolean;
}

export interface PageInfo {
  id: string;
  name: string;
  isCurrent?: boolean;
  info?: any;
  credentialId?: number | undefined;
}
