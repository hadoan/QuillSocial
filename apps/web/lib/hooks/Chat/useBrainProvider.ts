/* eslint-disable max-lines */
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CreateBrainInput,
  MinimalBrainForUser,
  Prompt,
} from "@lib/types/brains";
import {
  createBrain,
  deleteBrain,
  getBrains,
  getDefaultBrain,
} from "@lib/chat/brain";
import { getPublicPrompts } from "@lib/chat/prompt";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useBrainProvider = () => {
  const { t } = useTranslation(["delete_or_unsubscribe_from_brain"]);

  const [allBrains, setAllBrains] = useState<MinimalBrainForUser[]>([]);
  const [currentBrainId, setCurrentBrainId] = useState<null | string>(null);
  const [defaultBrainId, setDefaultBrainId] = useState<string>();
  const [isFetchingBrains, setIsFetchingBrains] = useState(false);
  const [publicPrompts, setPublicPrompts] = useState<Prompt[]>([]);
  const [currentPromptId, setCurrentPromptId] = useState<null | string>(null);

  const currentPrompt = publicPrompts.find(
    (prompt) => prompt.id === currentPromptId
  );
  const currentBrain = allBrains.find((brain) => brain.id === currentBrainId);

  const fetchAllBrains = useCallback(async () => {
    setIsFetchingBrains(true);
    try {
      const brains = await getBrains();
      setAllBrains(brains);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingBrains(false);
    }
  }, [getBrains]);

  const createBrainHandler = useCallback(
    async (brain: CreateBrainInput): Promise<string | undefined> => {
      const createdBrain = await createBrain(brain);
      try {
        setCurrentBrainId(createdBrain.id);

        // void track("BRAIN_CREATED");
        void fetchAllBrains();

        return createdBrain.id;
      } catch {
        // publish({
        //   variant: "danger",
        //   text: "Error occurred while creating a brain",
        // });
      }
    },
    [createBrain, fetchAllBrains]
    // publish, track
  );

  const deleteBrainHandler = useCallback(
    async (id: string) => {
      await deleteBrain(id);
      setAllBrains((prevBrains) =>
        prevBrains.filter((brain) => brain.id !== id)
      );
      // void track("DELETE_BRAIN");
      // publish({
      //   variant: "success",
      //   text: t("successfully_deleted"),
      // });
    },
    [deleteBrain]
    //publish, track
  );

  const fetchDefaultBrain = useCallback(async () => {
    const userDefaultBrain = await getDefaultBrain();
    if (userDefaultBrain !== undefined) {
      setDefaultBrainId(userDefaultBrain.id);
    }
    if (currentBrainId === null && userDefaultBrain !== undefined) {
      setCurrentBrainId(userDefaultBrain.id);
    }
  }, [currentBrainId, getDefaultBrain]);

  const fetchPublicPrompts = useCallback(async () => {
    setPublicPrompts(await getPublicPrompts());
  }, [getPublicPrompts]);

  return {
    allBrains,
    fetchAllBrains,
    isFetchingBrains,

    currentBrain,
    currentBrainId,
    setCurrentBrainId,

    defaultBrainId,
    fetchDefaultBrain,

    fetchPublicPrompts,
    publicPrompts,
    currentPrompt,

    setCurrentPromptId,
    currentPromptId,

    createBrain: createBrainHandler,

    deleteBrain: deleteBrainHandler,
  };
};
