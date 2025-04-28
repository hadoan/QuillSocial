import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";

import { APP_NAME } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Alert, Button, Form, TextField } from "@quillsocial/ui";

export default function XConsumerKeysSetup() {
  const { t } = useLocale();
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      apiKey: "",
      secret: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="bg-emphasis flex h-screen">
      <div className="bg-default m-auto rounded p-5 md:w-[560px] md:p-10">
        <div className="flex flex-col space-y-5 md:flex-row md:space-x-5 md:space-y-0">
          <div>
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src="/api/app-store/xconsumerkeyssocial/icon.svg"
              alt="X"
              className="h-12 w-12 max-w-2xl"
            />
          </div>
          <div>
            <h1 className="text-default">Config Consumer Key</h1>

            <div className="mt-1 text-sm">
              Generate Consumer Key to use with QuillAI at
              <a
                className="text-indigo-400"
                href="https://developer.twitter.com/en/portal/projects-and-apps"
                target="_blank"
                rel="noopener noreferrer"
              >
                &nbsp;https://developer.twitter.com/en/portal/projects-and-apps
              </a>
              . {t("credentials_stored_encrypted")} <br />
              Follow this guide to generate consumer key
              <a
                className="text-indigo-400"
                href="https://developer.x.com/en/docs/authentication/oauth-1-0a/api-key-and-secret"
                target="_blank"
                rel="noopener noreferrer"
              >
                &nbsp;https://developer.x.com/en/docs/authentication/oauth-1-0a/api-key-and-secret
              </a>
            </div>
            <div className="my-2 mt-3">
              <Form
                form={form}
                handleSubmit={async (values) => {
                  setErrorMessage("");
                  const res = await fetch(
                    "/api/integrations/xconsumerkeyssocial/add",
                    {
                      method: "POST",
                      body: JSON.stringify(values),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  const json = await res.json();
                  if (!res.ok) {
                    setErrorMessage(json?.message || t("something_went_wrong"));
                  } else {
                    router.push(json.url);
                  }
                }}
              >
                <fieldset
                  className="space-y-2"
                  disabled={form.formState.isSubmitting}
                >
                  <TextField
                    required
                    type="text"
                    {...form.register("apiKey")}
                    label="API Key"
                    placeholder=""
                  />
                  <TextField
                    required
                    type="text"
                    {...form.register("secret")}
                    label="API Key Secret"
                  />
                  <TextField
                    required
                    type="text"
                    {...form.register("secret")}
                    label="API Key Secret"
                  />
                  <TextField
                    required
                    type="text"
                    {...form.register("secret")}
                    label="API Key Secret"
                  />
                </fieldset>

                {errorMessage && (
                  <Alert
                    severity="error"
                    title={errorMessage}
                    className="my-4"
                  />
                )}
                <div className="mt-5 justify-end space-x-2 sm:mt-4 sm:flex rtl:space-x-reverse">
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => router.back()}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" loading={form.formState.isSubmitting}>
                    {t("save")}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
