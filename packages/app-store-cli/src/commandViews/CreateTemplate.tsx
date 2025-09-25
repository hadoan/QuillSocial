import { AppForm } from "../components/AppCreateUpdateForm";
import React from "react";

export default function CreateTemplate(
  props: Omit<React.ComponentProps<typeof AppForm>, "action">
) {
  return <AppForm action="create-template" {...props} />;
}
