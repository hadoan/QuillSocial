import DeleteForm from "../components/DeleteForm";
import React from "react";

export default function Delete({ slug }: { slug: string }) {
  return <DeleteForm slug={slug} action="delete-template" />;
}
