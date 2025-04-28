import { getLayout } from "@quillsocial/features/settings/layouts/SettingsLayout";
import { classNames } from "@quillsocial/lib";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Button, Meta } from "@quillsocial/ui";
import { ExternalLink } from "@quillsocial/ui/components/icon";
import { useRouter } from "next/router";

interface CtaRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const CtaRow = ({ title, description, className, children }: CtaRowProps) => {
  return (
    <>
      <section
        className={classNames(
          "text-default flex flex-col sm:flex-row",
          className
        )}
      >
        <div>
          <h2 className="font-medium">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="flex-shrink-0 pt-3 sm:ml-auto sm:pl-3 sm:pt-0">
          {children}
        </div>
      </section>
      <hr className="border-subtle" />
    </>
  );
};

const ManageBilling = () => {
  const { t } = useLocale();
  const router = useRouter();
  const returnTo = router.asPath;
  const billingHref = `/api/integrations/stripepayment/portal?returnTo=${WEBAPP_URL}${returnTo}`;

  return (
    <div className="space-y-6 text-sm sm:space-y-8">
      <CtaRow
        title={t("view_and_manage_billing_details")}
        description={t("view_and_edit_billing_details")}
      >
        <Button
          color="primary"
          className="text-white"
          href={billingHref}
          target="_blank"
          EndIcon={ExternalLink}
        >
          {t("billing_portal")}
        </Button>
      </CtaRow>
    </div>
  );
};

export default ManageBilling;
