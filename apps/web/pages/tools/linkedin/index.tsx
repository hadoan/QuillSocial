import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import type { GetServerSidePropsContext } from "next";

function RedirectPage() {
  return;
}

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerSession({ req, res });

  if (!session?.user?.id) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  return {
    redirect: {
      permanent: false,
      destination: "/tools/linkedin/headline-generator",
    },
  };
}

export default RedirectPage;
