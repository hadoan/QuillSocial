import { AppForm } from "../components/AppCreateUpdateForm";
import React from "react";

export default function Edit(
  props: Omit<React.ComponentProps<typeof AppForm>, "action">
) {
  return <AppForm action="edit-template" {...props} />;
}
