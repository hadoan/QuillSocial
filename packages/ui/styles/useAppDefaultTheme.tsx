import { useEffect } from "react";

type CssVariables = Record<string, string>;

// Sets up CSS Variables based on brand colours
const useAppDefaultTheme = (theme: Record<string, CssVariables>) => {
  useEffect(() => {
    Object.entries(theme).forEach(([key, value]) => {
      if (key === "root") {
        const root = document.documentElement;
        Object.entries(value).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
        return;
      }

      const elements = document.querySelectorAll(`.${key}`);
      const nestedEntries = Object.entries(value);
      nestedEntries.forEach(([nestedKey, nestedValue]) => {
        elements.forEach((element) => {
          (element as HTMLElement).style.setProperty(
            `--${nestedKey}`,
            nestedValue
          );
        });
      });
    });
  }, [theme]);
};

export { useAppDefaultTheme };
