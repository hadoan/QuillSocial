import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";

import { APP_NAME } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Alert, Button, Form, TextField } from "@quillsocial/ui";

export default function chatgptSetup() {
  const { t } = useLocale();
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      organizationId: "",
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
              src="/api/app-store/chatgptai/icon.svg"
              alt="ChatGPT"
              className="h-12 w-12 max-w-2xl"
            />
          </div>
          <div>
            <h1 className="text-default">OpenAI API Key</h1>

            <div className="mt-1 text-sm">
              This application requires you to have your own OpenAI API key.
              This key allows you to interact with OpenAI's powerful language
              models including GPT-4 and GPT-3.5-turbo. You can obtain your key
              by signing up on OpenAI's website{" "}
              <a
                className="text-indigo-400"
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              . Rest assured that your OpenAI key will be encrypted and securely
              protected.
            </div>
            <div className="my-2 mt-3">
              <Form
                form={form}
                handleSubmit={async (values) => {
                  setErrorMessage("");
                  const res = await fetch("/api/integrations/chatgptai/add", {
                    method: "POST",
                    body: JSON.stringify(values),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
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
                    {...form.register("organizationId")}
                    label="Organization ID"
                  />
                  <TextField
                    required
                    type="text"
                    {...form.register("apiKey")}
                    label="API Key"
                    placeholder=""
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
