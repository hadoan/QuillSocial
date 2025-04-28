"use client";

import { BrainContextType } from "@lib/types/brains";
import { createContext } from "react";
import { useBrainProvider } from "./useBrainProvider";

export const BrainContext = createContext<BrainContextType | undefined>(
  undefined
);

export const BrainProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const brainProviderUtils = useBrainProvider();

  return (
    <BrainContext.Provider value={brainProviderUtils}>
      {children}
    </BrainContext.Provider>
  );
};
