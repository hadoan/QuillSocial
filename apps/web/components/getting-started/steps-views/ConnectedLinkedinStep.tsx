import classNames from "@quillsocial/lib/classNames";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import { List } from "@quillsocial/ui";
import { ArrowRight } from "@quillsocial/ui/components/icon";
import { Button } from "@quillsocial/ui";

import { StepConnectionLoader } from "../components/StepConnectionLoader";
import { AppConnectionItem } from "./AppConnectionItem";

interface ConnectedAppStepProps {
  nextStep: () => void;
}

const ConnectedLinkedinStep = (props: ConnectedAppStepProps) => {
  const { nextStep } = props;
  const { data: queryConnectedVideoApps, isLoading } =
    trpc.viewer.integrations.useQuery({
      variant: "social",
      onlyInstalled: false,
      slug: "linkedin-social",
    });
  const { t } = useLocale();

  const hasAnyInstalledVideoApps = queryConnectedVideoApps?.items.some(
    (item) => item.credentialIds.length > 0
  );

  return (
    <>
      {!isLoading && (
        <List className="bg-default  border-subtle divide-subtle scroll-bar mx-1 max-h-[45vh] divide-y !overflow-y-scroll rounded-md border p-0 sm:mx-0">
          {queryConnectedVideoApps?.items &&
            queryConnectedVideoApps?.items.map((item) => {
              return (
                <li key={item.name}>
                  {item.name && item.logo && (
                    <AppConnectionItem
                      type={item.type}
                      title={item.name}
                      description={item.description}
                      logo={item.logo}
                      installed={item.credentialIds.length > 0}
                    />
                  )}
                </li>
              );
            })}
        </List>
      )}

      {isLoading && <StepConnectionLoader />}
      <Button
        type="button"
        data-testid="save-video-button"
        className={classNames(
          "text-white mt-8 flex w-full flex-row justify-center rounded-md border border-awst bg-awst hover:bg-awsthv p-2 text-center text-sm",
          ""
        )}
        // disabled={!hasAnyInstalledVideoApps}
        onClick={() => nextStep()}
      >
        {t("next_step_text")}
        <ArrowRight className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </>
  );
};

export { ConnectedLinkedinStep };
