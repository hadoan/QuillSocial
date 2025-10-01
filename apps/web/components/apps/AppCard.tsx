import InstallApp from "@components/apps/InstallApp";
import type { FC } from "react";
import type { App as AppType } from "@quillsocial/types/App";

type AppCardProps = {
  title: string;
  description: string;
  logoSrc: string;
  installProps: {
    type: AppType["type"];
    slug: string;
    variant: string;
    allowedMultipleInstalls: boolean;
  };
};

const AppCard: FC<AppCardProps> = ({ title, description, logoSrc, installProps }) => {
  return (
    <div className="bg-default flex flex-col rounded-s p-6 shadow">
      <div className="h-[50px] w-[50px]">
        <img src={logoSrc} alt={`${title} logo`} />
      </div>
      <div className="mt-4 text-sm font-bold">{title}</div>
      <div className="mb-4 flex-1 text-xs font-normal leading-6">{description}</div>
      <div>
        <InstallApp
          type={installProps.type}
          slug={installProps.slug}
          variant={installProps.variant}
          allowedMultipleInstalls={installProps.allowedMultipleInstalls}
        />
      </div>
    </div>
  );
};

export default AppCard;
