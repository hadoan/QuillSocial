import dayjs from "@quillsocial/dayjs";
import { FULL_NAME_LENGTH_MAX_LIMIT } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import { Button, TimezoneSelect } from "@quillsocial/ui";
import { ArrowRight } from "@quillsocial/ui/components/icon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getBrowerTimeZone } from "@components/timezone";

interface IUserSettingsProps {
  nextStep: () => void;
  hideUsername?: boolean;
}

const UserSettings = (props: IUserSettingsProps) => {
  const { nextStep } = props;
  const [user] = trpc.viewer.me.useSuspenseQuery();
  const { t } = useLocale();

  const tz = getBrowerTimeZone();
  const [selectedTimeZone, setSelectedTimeZone] = useState(tz);
  const userSettingsSchema = z.object({
    name: z
      .string()
      .min(1)
      .max(FULL_NAME_LENGTH_MAX_LIMIT, {
        message: t("max_limit_allowed_hint", {
          limit: FULL_NAME_LENGTH_MAX_LIMIT,
        }),
      }),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof userSettingsSchema>>({
    defaultValues: {
      name: user?.name || "",
    },
    reValidateMode: "onChange",
    resolver: zodResolver(userSettingsSchema),
  });

  const utils = trpc.useContext();
  const onSuccess = async () => {
    await utils.viewer.me.invalidate();
    nextStep();
  };
  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: onSuccess,
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate({
      name: data.name,
      timeZone: selectedTimeZone,
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
        {/* Username textfield: when not coming from signup */}

        {/* Full name textfield */}
        <div className="w-full">
          <label
            htmlFor="name"
            className="text-default mb-2 block text-sm font-medium"
          >
            {t("full_name")}
          </label>
          <input
            {...register("name", {
              required: true,
            })}
            id="name"
            name="name"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            className="border-default w-full rounded-md border text-sm"
          />
          {errors.name && (
            <p data-testid="required" className="py-2 text-xs text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>
        {/* Timezone select field */}
        <div className="w-full">
          <label
            htmlFor="timeZone"
            className="text-default block text-sm font-medium"
          >
            {t("timezone")}
          </label>

          <TimezoneSelect
            id="timeZone"
            value={selectedTimeZone}
            onChange={({ value }) => setSelectedTimeZone(value)}
            className="mt-2 w-full rounded-md text-sm"
          />

          <p className="text-subtle dark:text-inverted mt-3 flex flex-row font-sans text-xs leading-tight">
            {t("current_time")}{" "}
            {dayjs().tz(selectedTimeZone).format("LT").toString().toLowerCase()}
          </p>
        </div>
      </div>
      <Button
        disabled={mutation.isLoading}
        type="submit"
        className="mt-8 flex w-full flex-row justify-center text-white"
      >
        {t("next_step_text")}
        <ArrowRight className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </form>
  );
};

export { UserSettings };
