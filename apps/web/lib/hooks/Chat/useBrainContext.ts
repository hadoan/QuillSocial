import { BrainContext } from "./brain-provider";
import { BrainContextType } from "@lib/types/brains";
import { useContext } from "react";

export const useBrainContext = (): BrainContextType => {
  const context = useContext(BrainContext);

  if (context === undefined) {
    throw new Error("useBrainContext must be used inside BrainProvider");
  }

  return context;
};
