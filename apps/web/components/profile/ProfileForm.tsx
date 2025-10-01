import { zodResolver } from "@hookform/resolvers/zod";
import { FULL_NAME_LENGTH_MAX_LIMIT } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Button, Dialog, DialogTrigger, DialogContent, DialogFooter, DialogClose, Form, ImageUploader, Avatar, TextField, InputField, TextAreaField } from "@quillsocial/ui";
import { useForm, useFormContext, Controller } from "react-hook-form";
import { z } from "zod";
import type { FC } from "react";

type FormValues = {
  username: string;
  avatar: string;
  name: string;
  email: string;
  bio: string;
  mobile: string;
  timeZone: string;
  timeFormat: number;
  weekStart: string;
  description?: string;
  speakAbout?: string;
};

export const NewPasswordButton = ({ name = "new-password" }: { name?: string }) => {
  const { t } = useLocale();
  const form = useFormContext<{
    password: string;
    newPassword: string;
    passWordConfirm: string;
  }>();
  const { register } = form;
  return (
    <Dialog name={name}>
      <DialogTrigger asChild>
        <Button className="bg-awstbgbt text-awst w-full pl-[30%] text-sm hover:text-white" data-testid={name}>
          {t("Password Change")}
        </Button>
      </DialogTrigger>
      <DialogContent title={t("Password Change")}>
        <Form form={form} handleSubmit={(values) => values}>
          <InputField label={t("Old Pasword")} type="password" required placeholder={t("*********")} {...register("password")} />
          <InputField label={t("New Password")} type="password" required placeholder={t("*********")} {...register("newPassword")} />
          <InputField label={t("Confirm Password")} type="password" required placeholder={t("*********")} {...register("passWordConfirm")} />
          <DialogFooter>
            <DialogClose />
            <Button type="submit" className="hover:bg-awst text-white">
              {t("continue")}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const ProfileForm: FC<{ defaultValues: FormValues; onSubmit: (values: FormValues) => void; isLoading?: boolean }> = ({ defaultValues, onSubmit, isLoading = false }) => {
  const { t } = useLocale();
  const profileFormSchema = z.object({
    username: z.string(),
    avatar: z.string(),
    name: z.string().trim().min(1, t("you_need_to_add_a_name")).max(FULL_NAME_LENGTH_MAX_LIMIT, { message: t("max_limit_allowed_hint", { limit: FULL_NAME_LENGTH_MAX_LIMIT }) }),
    email: z.string().email(),
    bio: z.string(),
    weekStart: z.string(),
    mobile: z.string(),
    description: z.string().optional(),
    speakAbout: z.string().optional(),
  });

  const formMethods = useForm<FormValues>({ defaultValues, resolver: zodResolver(profileFormSchema) });

  const { formState: { isSubmitting, errors, isDirty } } = formMethods;
  const isDisabled = isSubmitting || !isDirty;

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <div className="flex items-center">
        <Controller control={formMethods.control} name="avatar" render={({ field: { value } }) => (
          <>
            <div className="mt-5 flex">
              <div className="flex h-[60px] w-full items-center ">
                <ImageUploader target="avatar" className="mr-4 w-14 border-none  bg-gray-50" id="avatar-upload" buttonMsg={<Avatar alt="" className="-ml-[18px]" imageSrc={value} gravatarFallbackMd5="fallback" size="lg" />} handleImageChange={(newAvatar) => { formMethods.setValue("avatar", newAvatar, { shouldDirty: true }); }} imageSrc={value || undefined} />
                <span className="font-bold">{defaultValues.name}</span>
              </div>
            </div>
          </>
        )} />
      </div>
      <div className="mt-9">
        <TextField label={t("full_name")} {...formMethods.register("name")} />
      </div>
      <div className="mt-9">
        <TextField label={t("Email address")} {...formMethods.register("email")} />
      </div>
      <div className="mt-9">
        <InputField type="text" placeholder="+4 123 456 789 0" label="Mobile" {...formMethods.register("mobile")} className="disabled:bg-emphasis rounded-md border border-[#D5D9DC]" required />
      </div>
      <div className="mt-9">
        <TextField {...formMethods.register("description")} label={<><div className="flex flex-col"><span className="text-subtle font-bold"> My Description</span><span className="text-subtle font-normal">Short overview of you - a unique Linkedln headline is enough</span></div></>} />
      </div>
      <div className="mt-9">
        <TextAreaField {...formMethods.register("speakAbout")} label={<><div className="flex flex-col"><span className="text-subtle font-bold"> I Speak About</span><span className="text-subtle font-normal">The key topics you frequently write about - separated by comma</span></div></>} />
      </div>
      <div className="mt-9 flex flex-col">
        <label className="mb-2 w-full text-[14px]">Password</label>
        <NewPasswordButton />
      </div>
      <Button loading={isLoading} disabled={isDisabled} color="primary" className="mt-8 text-white" type="submit">Save Changes</Button>
    </Form>
  );
};

export default ProfileForm;
