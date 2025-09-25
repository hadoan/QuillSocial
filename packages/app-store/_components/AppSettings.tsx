import { DynamicComponent } from "./DynamicComponent";
import { AppSettingsComponentsMap } from "@quillsocial/app-store/apps.browser.generated";

export const AppSettings = (props: { slug: string }) => {
  return (
    <DynamicComponent<typeof AppSettingsComponentsMap>
      wrapperClassName="border-t border-subtle p-6"
      componentMap={AppSettingsComponentsMap}
      {...props}
    />
  );
};
