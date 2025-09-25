import { AppForm } from "../components/AppCreateUpdateForm";
import React from "react";

export default function Create(
  props: Omit<React.ComponentProps<typeof AppForm>, "action">
) {
  return <AppForm action="create" {...props} />;
}
