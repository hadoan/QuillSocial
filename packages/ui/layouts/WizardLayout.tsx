import { APP_NAME } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { StepCard, Steps, Button, SkeletonText } from "@quillsocial/ui";
import { noop } from "lodash";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export function WizardLayout({
  children,
  maxSteps = 2,
  currentStep = 0,
  isOptionalCallback,
}: {
  children: React.ReactNode;
} & {
  maxSteps?: number;
  currentStep?: number;
  isOptionalCallback?: () => void;
}) {
  const { t, isLocaleReady } = useLocale();
  const [meta, setMeta] = useState({ title: "", subtitle: " " });
  const router = useRouter();
  const { title, subtitle } = meta;

  useEffect(() => {
    setMeta({
      title: window.document.title,
      subtitle:
        window.document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "",
    });
  }, [router.asPath]);

  return (
    <div
      className="dark:bg-brand dark:text-brand-contrast text-emphasis min-h-screen"
      data-testid="onboarding"
    >
      <div>
        <Toaster position="bottom-right" />
      </div>
      <div className="mx-auto px-4 py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
            <div className="mx-auto sm:max-w-[520px]">
              <header>
                {isLocaleReady ? (
                  <>
                    <p className="font-quill mb-3 text-[28px] font-medium leading-7">
                      {title.replace(` | ${APP_NAME}`, "")}&nbsp;
                    </p>
                    <p className="text-subtle font-sans text-sm font-normal">
                      {subtitle}&nbsp;
                    </p>
                  </>
                ) : (
                  <>
                    <SkeletonText className="h-6 w-1/2" />
                    <SkeletonText className="mt-4 h-4 w-3/4" />
                  </>
                )}
              </header>
              <Steps
                maxSteps={maxSteps}
                currentStep={currentStep}
                navigateToStep={noop}
              />
            </div>
            <StepCard>{children}</StepCard>
          </div>
        </div>
        {isOptionalCallback && (
          <div className="mt-4 flex justify-center">
            <Button color="minimal" onClick={isOptionalCallback}>
              {t("ill_do_this_later")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const getLayout = (page: React.ReactElement) => (
  <WizardLayout>{page}</WizardLayout>
);
