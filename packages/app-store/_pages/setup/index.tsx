import dynamic from "next/dynamic";

import { DynamicComponent } from "../../_components/DynamicComponent";

export const AppSetupMap = {
  "xconsumerkeys-social": dynamic(() => import("../../xconsumerkeyssocial/pages/setup")),
  "chatgpt-ai": dynamic(() => import("../../chatgptai/pages/setup")),
};

export const AppSetupPage = (props: { slug: string }) => {
  return <DynamicComponent<typeof AppSetupMap> componentMap={AppSetupMap} {...props} />;
};

export default AppSetupPage;
