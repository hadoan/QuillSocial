import slugify from "@quillsocial/lib/slugify";
import prisma from "@quillsocial/prisma";

export async function checkRegularUsername(_username: string, currentOrgDomain?: string | null) {
  const username = slugify(_username);
  const premium = !!process.env.NEXT_PUBLIC_IS_E2E && username.length < 5;

  const user = await prisma.user.findFirst({
    where: {
      username,
      organization: currentOrgDomain
        ? {
            slug: currentOrgDomain,
          }
        : null,
    },
    select: {
      username: true,
    },
  });

  if (user) {
    return {
      available: false as const,
      premium,
      message: "A user exists with that username",
    };
  }
  return {
    available: true as const,
    premium,
  };
}
