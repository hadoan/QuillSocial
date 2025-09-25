import PageWrapper from "@components/PageWrapper";
import Shell, {
  MobileNavigationMoreItems,
} from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import useMeQuery from "@quillsocial/trpc/react/hooks/useMeQuery";

export default function MorePage() {
  const { t } = useLocale();
  const { data: user } = useMeQuery();

  return (
    user?.isAdmin && (
      <Shell hideHeadingOnMobile>
        <div className="max-w-screen-lg md:hidden">
          <MobileNavigationMoreItems />
          {/* <p className="text-subtle mt-6 text-xs leading-tight md:hidden">{t("more_page_footer")}</p> */}
        </div>
      </Shell>
    )
  );
}
MorePage.PageWrapper = PageWrapper;
