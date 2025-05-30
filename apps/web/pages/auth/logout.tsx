import type { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Button } from "@quillsocial/ui";
import { Check } from "@quillsocial/ui/components/icon";

import type { inferSSRProps } from "@lib/types/inferSSRProps";

import PageWrapper from "@components/PageWrapper";
import AuthContainer from "@components/ui/AuthContainer";

import { ssrInit } from "@server/lib/ssr";

type Props = inferSSRProps<typeof getServerSideProps>;

export function Logout(props: Props) {
  const { status } = useSession();
  if (status === "authenticated") signOut({ redirect: false });
  const router = useRouter();
  useEffect(() => {
    if (props.query?.survey === "true") {
      router.push(`${WEBAPP_URL}/cancellation`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.query?.survey]);
  const { t } = useLocale();

  return (
    <AuthContainer
      title={t("logged_out")}
      description={t("youve_been_logged_out")}
      showLogo
    >
      <div className="mb-4">
        <div className="bg-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <Check className="h-6 w-6 text-awst" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3
            className="text-awstttt text-lg font-medium leading-6"
            id="modal-title"
          >
            {t("youve_been_logged_out")}
          </h3>
          <div className="mt-2">
            <p className="text-awstdr text-sm">{t("hope_to_see_you_soon")}</p>
          </div>
        </div>
      </div>
      <Button
        href="/auth/login"
        className="flex w-full justify-center text-white"
      >
        {t("go_back_login")}
      </Button>
    </AuthContainer>
  );
}

Logout.isThemeSupported = false;
Logout.PageWrapper = PageWrapper;
export default Logout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssr = await ssrInit(context);
  // Deleting old cookie manually, remove this code after all existing cookies have expired
  context.res.setHeader(
    "Set-Cookie",
    "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
  );

  return {
    props: {
      trpcState: ssr.dehydrate(),
      query: context.query,
    },
  };
}
