import PageWrapper from "@components/PageWrapper";
import PostList from "@components/ai-write/post-list";
import { checkSocialTokenValid } from "@lib/checkSocialTokenValid";
import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Alert, Button, HeadSeo } from "@quillsocial/ui";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";

const ReconnectSocialBanner = ({
  closeAction,
}: {
  closeAction: () => void;
}) => {
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
        try {
          const { data } = await checkSocialTokenValid();
          if (!data.valid) {
            setShowConnectSocialBanner(true);
          }
        } catch (err) {
          // Log the error and don't throw so client module loading isn't aborted
          // eslint-disable-next-line no-console
          console.error("AIWrite checkSocialTokenValid error:", err);
          setShowConnectSocialBanner(false);
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
          {showConnectSocialBanner && (
            <ReconnectSocialBanner closeAction={closeConnectSocialBanner} />
          )}
          <PostList></PostList>
        </div>
      </Shell>
    </>
  );
};
AIWritePage.PageWrapper = PageWrapper;
export default AIWritePage;
