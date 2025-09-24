import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import { z } from "zod";

import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { APP_NAME } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { useParamsWithFallback } from "@quillsocial/lib/hooks/useParamsWithFallback";
import prisma from "@quillsocial/prisma";
import { trpc } from "@quillsocial/trpc";
import { Button, StepCard, Steps } from "@quillsocial/ui";
import { Loader } from "@quillsocial/ui/components/icon";

import PageWrapper from "@components/PageWrapper";
import { ConnectedLinkedinStep } from "@components/getting-started/steps-views/ConnectedLinkedinStep";
import GhostWriteSetting from "@components/getting-started/steps-views/GhostWriteSetting";
import { UserSettings } from "@components/getting-started/steps-views/UserSettings";

import { ssrInit } from "@server/lib/ssr";

const INITIAL_STEP = "user-settings";
const steps = [
  "user-settings",
  "connected-apps",
  "ghost-writer-setting",
] as const;

const stepTransform = (step: (typeof steps)[number]) => {
  const stepIndex = steps.indexOf(step);
  if (stepIndex > -1) {
    return steps[stepIndex];
  }
  return INITIAL_STEP;
};

const stepRouteSchema = z.object({
  step: z.array(z.enum(steps)).default([INITIAL_STEP]),
  from: z.string().optional(),
});

// TODO: Refactor how steps work to be contained in one array/object. Currently we have steps,initalsteps,headers etc. These can all be in one place
const OnboardingPage = () => {
  const pathname = usePathname();
  const params = useParamsWithFallback();
  const router = useRouter();
  const [user] = trpc.viewer.me.useSuspenseQuery();
  const { t } = useLocale();
  const result = stepRouteSchema.safeParse(params);
  const currentStep = result.success ? result.data.step[0] : INITIAL_STEP;
  const from = result.success ? result.data.from : "";

  const headers = [
    {
      title: `${t("welcome_to_cal_header", { appName: APP_NAME })}`,
      subtitle: [
        `${t("we_just_need_basic_info")}`,
        `${t("edit_form_later_subtitle")}`,
      ],
    },
    {
      title: "Connect to your LinkedIn account",
      subtitle: [],
    },
    {
      title: "Setup your settings",
      subtitle: [],
    },
  ];

  const goToIndex = (index: number) => {
    const newStep = steps[index];
    router.push(`/getting-started/${stepTransform(newStep)}`);
  };

  const currentStepIndex = steps.indexOf(currentStep);
  return (
    <div
      className="dark:bg-brand dark:text-brand-contrast text-emphasis min-h-screen"
      data-testid="onboarding"
      style={
        {
          "--quill-brand": "#111827",
          "--quill-brand-emphasis": "#101010",
          "--quill-brand-text": "white",
          "--quill-brand-subtle": "#9CA3AF",
        } as CSSProperties
      }
      key={pathname}
    >
      <Head>
        <title>{`${APP_NAME} - ${t("getting_started")}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto px-4 py-6 md:py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
            <div className="mx-auto sm:max-w-[520px]">
              <header>
                <p className="font-quill mb-3 text-[28px] font-medium leading-7">
                  {headers[currentStepIndex]?.title || "Undefined title"}
                </p>

                {headers[currentStepIndex]?.subtitle.map((subtitle, index) => (
                  <p
                    className="text-subtle font-sans text-sm font-normal"
                    key={index}
                  >
                    {subtitle}
                  </p>
                ))}
              </header>
              <Steps
                maxSteps={steps.length}
                currentStep={currentStepIndex + 1}
                navigateToStep={goToIndex}
              />
            </div>
            <StepCard>
              <Suspense fallback={<Loader />}>
                {currentStep === "user-settings" && (
                  <UserSettings
                    nextStep={() => goToIndex(1)}
                    hideUsername={from === "signup"}
                    prefillName={from === "signup" ? user?.name : undefined}
                  />
                )}
                {/* {currentStep === "connected-apps" && <ConnectedCalendars nextStep={() => goToIndex(3)} />}*/}
                {currentStep === "connected-apps" && (
                  <ConnectedLinkedinStep nextStep={() => goToIndex(2)} />
                )}

                {currentStep === "ghost-writer-setting" && (
                  <GhostWriteSetting />
                )}
              </Suspense>
            </StepCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res } = context;

  const session = await getServerSession({ req, res });

  if (!session?.user?.id) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  const ssr = await ssrInit(context);

  await ssr.viewer.me.prefetch();

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      completedOnboarding: true,
      teams: {
        select: {
          accepted: true,
          team: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User from session not found");
  }

  if (user.completedOnboarding) {
    return { redirect: { permanent: false, destination: "/write/0" } };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "", ["common"])),
      trpcState: ssr.dehydrate(),
      hasPendingInvites:
        user.teams.find((team) => team.accepted === false) ?? false,
    },
  };
};

OnboardingPage.isThemeSupported = false;
OnboardingPage.PageWrapper = PageWrapper;

export default OnboardingPage;
