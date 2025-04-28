import { useRouter } from "next/router";

import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { HeadSeo } from "@quillsocial/ui";
import PageWrapper from "@components/PageWrapper";
import MainTemplate from "@components/post-generator/mainTemplate";

const PostGeneratorPageTemplate = () => {
  const { t } = useLocale();

  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <HeadSeo title={t("My-Content")} description="Generate posts with AI" />
      <Shell
        withoutSeo
        heading={`Generate posts with AI`}
        hideHeadingOnMobile
        subtitle="Select a template to generate high-quality posts with AI">
        <div className="pb-10">
          <div className=" items-center justify-center">
            <MainTemplate id={`${id}`} />
          </div>
        </div>
      </Shell>
    </>
  );
};
PostGeneratorPageTemplate.PageWrapper = PageWrapper;
export default PostGeneratorPageTemplate;
