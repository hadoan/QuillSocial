import PageWrapper from "@components/PageWrapper";
import Card from "@components/post-generator/card";
import { templatesInfo } from "@components/post-generator/constTemplateWrapper";
import { ChatProvider } from "@lib/hooks/Chat/ChatProvider";
import { BrainProvider } from "@lib/hooks/Chat/brain-provider";
import useMeQuery from "@lib/hooks/useMeQuery";
import dayjs from "@quillsocial/dayjs";
import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import { Button, HeadSeo, showToast } from "@quillsocial/ui";
import { HorizontalTabs } from "@quillsocial/ui";
import type {
  VerticalTabItemProps,
  HorizontalTabItemProps,
} from "@quillsocial/ui";
import { Dialog, DialogContent } from "@quillsocial/ui";
import { Mail } from "@quillsocial/ui/components/icon";
import { debounce } from "lodash";
import {
  Heart,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Search,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { components } from "react-select";

const PostGeneratorPage = () => {
  const { t } = useLocale();
  const router = useRouter();
  const [idea, setIdea] = useState("all");
  const [nameMenu, setnameMenu] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [credentialId, setCredentialId] = useState();

  const query = useMeQuery();

  const handleCardClick = (code: string) => {
    if (!ischeckForAIAppsLoading && !isAIPresent) {
      showToast(
        "Please install ChatGPT app from Apps menu to use this feature",
        "error"
      );
      router.push(`/settings/my-account/app-integrations`);
      return;
    }
    router.push(`/post-generator/templates/${code}`);
  };

  const { isLoading: ischeckForAIAppsLoading, data: isAIPresent } =
    trpc.viewer.appsRouter.checkForAIApps.useQuery();

  return (
    <>
      <HeadSeo title={t("My-Content")} description="Generate posts with AI" />
      <Shell
        withoutSeo
        heading={`Generate posts with AI`}
        subtitle="Select a template to generate high-quality posts with AI"
      >
        <div className="w-[220px]"></div>
        <div className="pb-10">
          <div className="mt-2 flex items-center justify-center">
            <div className="mb-5 flex flex-wrap justify-center gap-5 md:justify-start">
              {templatesInfo.map((info) => (
                <div
                  key={info.id}
                  onClick={() => handleCardClick(info.code)}
                  className="hover:cursor-pointer"
                >
                  <Card
                    key={info.id}
                    title={info.title}
                    subtitle={info.subtitle}
                    description={info.description}
                    isNew={info.isNew}
                    backgroundColor={info.backgroundColor}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </>
  );
};
PostGeneratorPage.PageWrapper = PageWrapper;
export default PostGeneratorPage;
