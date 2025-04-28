import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";

import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Alert, Button, HeadSeo } from "@quillsocial/ui";

import { checkSocialTokenValid } from "@lib/checkSocialTokenValid";

import PageWrapper from "@components/PageWrapper";
import PostList from "@components/ai-write/post-list";

const ReconnectSocialBanner = ({ closeAction }: { closeAction: () => void }) => {
  const { t } = useLocale();
  return (
    <Alert
      className="my-2 ml-4 mr-4"
      severity="error"
      title="Setup your social account"
      message="Couldn't connect to your social account, please add a new account to start."
      actions={
        <div className="flex gap-1">
          <Button color="minimal" onClick={closeAction}>
            {t("dismiss")}
          </Button>
          <Button color="primary" href="/settings/my-account/app-integrations">
            {t("set_up")}
          </Button>
        </div>
      }
    />
  );
};

const AIWritePage = () => {
  const [showConnectSocialBanner, setShowConnectSocialBanner] = useState(false);
  const debouncedApiCall = useMemo(
    () =>
      debounce(async () => {
        const { data } = await checkSocialTokenValid();
        if (!data.valid) {
          setShowConnectSocialBanner(true);
        }
      }, 150),
    []
  );

  useEffect(() => {
    debouncedApiCall();
  }, [debouncedApiCall]);

  function closeConnectSocialBanner() {
    setShowConnectSocialBanner(false);
  }

  const { t } = useLocale();
  return (
    <>
      <HeadSeo title={t("AI-Write")} description={""} />
      <Shell withoutSeo heading={"AI Write"} hideHeadingOnMobile>
        <div>
          {showConnectSocialBanner && <ReconnectSocialBanner closeAction={closeConnectSocialBanner} />}
          <PostList></PostList>
        </div>
      </Shell>
    </>
  );
};
AIWritePage.PageWrapper = PageWrapper;
export default AIWritePage;
