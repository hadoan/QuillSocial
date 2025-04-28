import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import { Button, TextAreaField, TextField, showToast } from "@quillsocial/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  description: string;
  speakAbout: string;
};
const GhostWriteSetting = () => {
  const [user] = trpc.viewer.me.useSuspenseQuery();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      description: user?.description || "",
      speakAbout: user?.speakAbout || "",
    },
  });

  const utils = trpc.useContext();
  const router = useRouter();
  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async (_data, context) => {
      if (context.avatar) {
        showToast(t("your_user_profile_updated_successfully"), "success");
        await utils.viewer.me.refetch();
      } else {
        await utils.viewer.me.refetch();
        router.push("/");
      }
    },
    onError: () => {
      setIsLoading(false);
      showToast(t("problem_saving_user_profile"), "error");
    },
  });

  const onSubmit = handleSubmit(
    (data: { description: string; speakAbout: string }) => {
      setIsLoading(true);
      const { description, speakAbout } = data;
      mutation.mutate({
        description,
        speakAbout,
        completedOnboarding: true,
      });
    }
  );

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-row items-center justify-center ">
        <div className="flex items-center flex-col px-4">
          <span className="text-subtle flex text-[20px] font-bold">
            {" "}
            QuillAI Setting
            <img className="ml-2" src="/icon_sparkling.png"></img>
          </span>
          <span className="text-subtle font-normal">
            Config your AI QuillAI setting and preference.
          </span>
        </div>
      </div>
      <fieldset className="mt-8">
        <TextField
          {...register("description")}
          label={
            <>
              <div className="flex flex-col">
                <span className="text-subtle font-bold"> My Description</span>
                <span className="text-subtle font-normal">
                  Short overview of you - a unique Linkedln headline is enough
                </span>
              </div>
            </>
          }
        />
      </fieldset>
      <fieldset className="mt-2">
        <TextAreaField
          {...register("speakAbout")}
          label={
            <>
              <div className="flex flex-col">
                <span className="text-subtle font-bold"> I Speak About</span>
                <span className="text-subtle font-normal">
                  The key topics you frequently write about - separated by comma
                </span>
              </div>
            </>
          }
        />
      </fieldset>
      <Button
        type="submit"
        disabled={isLoading}
        className="text-white  text-inverted mt-8 flex w-full flex-row justify-center rounded-md border p-2 text-center text-sm"
      >
        {t("Save Settings")}
      </Button>
    </form>
  );
};

export default GhostWriteSetting;
