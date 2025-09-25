/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @next/next/no-html-link-for-pages */
import PageWrapper from "@components/PageWrapper";
import AuthContainer from "@components/ui/AuthContainer";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Button, EmailField } from "@quillsocial/ui";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import type { SyntheticEvent } from "react";
import React from "react";

export default function ForgotPassword({ csrfToken }: { csrfToken: string }) {
  const { t, i18n } = useLocale();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<{ message: string } | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const router = useRouter();

  const handleChange = (e: SyntheticEvent) => {
    const target = e.target as typeof e.target & { value: string };
    setEmail(target.value);
  };

  const submitForgotPasswordRequest = async ({ email }: { email: string }) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email, language: i18n.language }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json);
      } else if ("resetLink" in json) {
        router.push(json.resetLink);
      } else {
        setSuccess(true);
      }

      return json;
    } catch (reason) {
      setError({ message: t("unexpected_error_try_again") });
    } finally {
      setLoading(false);
    }
  };

  const debouncedHandleSubmitPasswordRequest = debounce(
    submitForgotPasswordRequest,
    250
  );

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    await debouncedHandleSubmitPasswordRequest({ email });
  };

  const Success = () => {
    return (
      <div className="space-y-6 text-sm leading-normal ">
        {/* <p className="">{t("password_reset_email", { email })}</p>
        <p className="">{t("password_reset_leading")}</p> */}
        {error && <p className="text-center text-red-600">{error.message}</p>}
        <Button className="w-full justify-center text-white" href="/auth/login">
          Back to sign in
        </Button>
      </div>
    );
  };

  return (
    <AuthContainer
      title={!success ? "Fogot Password? " : t("reset_link_sent")}
      heading={!success ? t("Fogot Password? ") : t("reset_link_sent")}
      description="Send Reset Email"
      footerText={
        !success && (
          <>
            <a href="/auth/login" className="text-emphasis font-medium">
              Back to sign in
            </a>
          </>
        )
      }
    >
      {success && <Success />}
      {!success && (
        <>
          <label className="text-emphasis mb-2 block space-y-6 text-sm font-medium">
            {" "}
            Email Address
          </label>
          <form className="space-y-6" onSubmit={handleSubmit} action="#">
            <div>
              <input
                name="csrfToken"
                type="hidden"
                defaultValue={csrfToken}
                hidden
              />
            </div>
            <EmailField
              onChange={handleChange}
              id="email"
              name="email"
              placeholder="john.doe@example.com"
              required
            />
            <div className="space-y-2">
              <Button
                className="w-full justify-center text-white"
                type="submit"
                disabled={loading}
                aria-label="Send Reset Email"
                loading={loading}
              >
                Send reset email
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthContainer>
  );
}

ForgotPassword.isThemeSupported = false;
ForgotPassword.PageWrapper = PageWrapper;

// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//   const { req, res } = context;

//   const session = await getServerSession({ req , res } as any);

//   if (session) {
//     res.writeHead(302, { Location: "/" });
//     res.end();
//     return { props: {} };
//   }

//   return {
//     props: {
//       csrfToken: await getCsrfToken(context),
//       ...(await serverSideTranslations(context.locale || "en", ["common"])),
//     },
//   };
// };
