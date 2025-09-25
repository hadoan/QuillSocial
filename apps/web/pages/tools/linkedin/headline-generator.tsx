import PageWrapper from "@components/PageWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import { TextAreaField } from "@quillsocial/ui";
import {
  Button,
  Form,
  Meta,
  showToast,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
} from "@quillsocial/ui";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SkeletonLoader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <SkeletonContainer>
      <Shell>
        <Meta title={title} description={description} />
        <div className="mb-8 mt-6 space-y-6">
          <SkeletonText className="h-8 w-full" />
          <SkeletonText className="h-8 w-full" />
          <SkeletonText className="h-8 w-full" />

          <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
        </div>
      </Shell>
    </SkeletonContainer>
  );
};

type FormValues = {
  cv: string;
};

const HeadlineGeneratorView = () => {
  const { t } = useLocale();
  const { data: user, isLoading } = trpc.viewer.me.useQuery();
  const [headlines, setHeadlines] = useState<string[]>([]);
  const { data: avatar, isLoading: isLoadingAvatar } =
    trpc.viewer.avatar.useQuery();
  const router = useRouter();

  const { isLoading: ischeckForAIAppsLoading, data: isAIPresent } =
    trpc.viewer.appsRouter.checkForAIApps.useQuery();

  const mutation = trpc.viewer.generateHeadline.useMutation({
    onSuccess: (data) => {
      // setHeadlines([data.answer1, data.answer2, data.answer3, data.answer4, data.answer5]);
      setHeadlines([
        data?.answer1 || "",
        data?.answer2 || "",
        data?.answer3 || "",
        data?.answer4 || "",
        data?.answer5 || "",
      ]);
      showToast("Generate headline successfully.", "success");
    },
    onError: () => {
      showToast("Error generating data", "error");
    },
  });

  if (isLoading || !user || isLoadingAvatar || !avatar)
    return (
      <SkeletonLoader
        title="Headline generator"
        description="LinkedIn Headline Generator creates highly engaging LinkedIn headlines to get more profile visits & grow your following."
      />
    );

  const defaultValues = {
    cv: "",
  };
  return (
    <>
      <Shell
        withoutSeo
        heading="Headline generator"
        hideHeadingOnMobile
        subtitle="LinkedIn Headline Generator creates highly engaging LinkedIn headlines to get more profile visits & grow your following."
      >
        <Meta
          title="Headline generator"
          description="LinkedIn Headline Generator creates highly engaging LinkedIn headlines to get more profile visits & grow your following."
        />

        <div className="grid grid-cols-12">
          <div className="col-span-10 ml-[50px] sm:col-span-10 sm:ml-1">
            <HeadlineGeneratorForm
              key={JSON.stringify(defaultValues)}
              defaultValues={defaultValues}
              isLoading={mutation.isLoading}
              onSubmit={(values) => {
                if (!ischeckForAIAppsLoading && !isAIPresent) {
                  showToast(
                    "Please install ChatGPT app from Apps menu to use this feature",
                    "error"
                  );
                  router.push(`/settings/my-account/app-integrations`);
                  return;
                }
                setHeadlines([]);
                mutation.mutate(values);
              }}
              headlines={headlines}
            />
          </div>
        </div>
      </Shell>
    </>
  );
};

const HeadlineGeneratorForm = ({
  defaultValues,
  onSubmit,
  headlines,
  isLoading = false,
}: {
  defaultValues: FormValues;
  onSubmit: (values: FormValues) => void;
  headlines: string[];
  isLoading: boolean;
}) => {
  const { t } = useLocale();
  const headlineGeneratorFormSchema = z.object({
    cv: z.string(),
  });

  const formMethods = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(headlineGeneratorFormSchema),
  });

  const {
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const isDisabled = isSubmitting || !isDirty;
  return (
    <>
      <Form form={formMethods} handleSubmit={onSubmit}>
        <div className="mt-2 w-full">
          <TextAreaField
            autoFocus={true}
            className="w-full"
            rows={15}
            {...formMethods.register("cv")}
            label={
              <>
                <div className="flex flex-col">
                  <span className="text-subtle font-bold"> Your CV</span>
                  <span className="text-subtle font-normal">
                    Add your CV's content here, you don't have to format your
                    CV.
                  </span>
                </div>
              </>
            }
          />
        </div>

        <Button
          loading={isLoading}
          disabled={isDisabled}
          color="primary"
          className="mt-8 text-white"
          type="submit"
        >
          Generate Headlines
        </Button>
      </Form>

      <div className="mx-auto mb-5 grid max-w-2xl auto-rows-fr grid-cols-1 gap-5 sm:mt-20  lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {headlines.map((headline, index) => (
          <article
            key={`headline-${index + 1}`}
            className="relative isolate flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white px-4 py-4  shadow "
          >
            <div className="mb-2 h-[120px]  max-h-[350px]  overflow-y-auto text-left text-sm">
              <span
                className=""
                dangerouslySetInnerHTML={{
                  __html: headline.replace(/\n/g, "<br />"),
                }}
              />
            </div>
            <div className="ml-auto space-x-2">
              <button
                className="rounded-xl bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                onClick={async () => {
                  await navigator.clipboard.writeText(headline);
                  showToast("Copy successfully", "success");
                }}
              >
                Copy
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

HeadlineGeneratorView.PageWrapper = PageWrapper;

export default HeadlineGeneratorView;
