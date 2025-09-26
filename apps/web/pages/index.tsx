import type { GetServerSidePropsContext } from "next";
import React from "react";

export default function HomePage() {
  // This component should never render due to the redirect in getServerSideProps
  return null;
}

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  // Always redirect to the write page
  return { redirect: { permanent: false, destination: "/write/0" } };
}
