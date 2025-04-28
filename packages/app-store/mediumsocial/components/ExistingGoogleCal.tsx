import { MY_APP_URL } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { AlertCircle, ArrowRight, Check } from "@quillsocial/ui/components/icon";
import Link from "next/link";

const ExistingGoogleCal = ({ gCalInstalled, appName }: { gCalInstalled?: boolean; appName: string }) => {
  const { t } = useLocale();

  return gCalInstalled ? (
    <div className="bg-subtle rounded-md px-4 py-3">
      <div className="items-start space-x-2.5">
        <div className="flex items-start">
          <div>
            <Check className="mr-2 mt-1 font-semibold" />
          </div>
          <div>
            <span className="font-semibold">{t("google_calendar_is_connected")}</span>
            <div>
              <div>
                <span>{t("requires_google_calendar")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-info text-info rounded-md px-4 py-3">
      <div className="items-start space-x-2.5">
        <div className="flex items-start">
          <div>
            <AlertCircle className="mr-2 mt-1 font-semibold" />
          </div>
          <div>
            <span className="font-semibold">{t("this_app_requires_google_calendar", { appName })}</span>
            <div>
              <div>
                <>
                  <Link
                    href={`${MY_APP_URL}/apps/google-calendar`}
                    className="text-info flex items-center underline">
                    <span className="mr-1">{t("connect_google_calendar")}</span>
                    <ArrowRight />
                  </Link>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExistingGoogleCal;
