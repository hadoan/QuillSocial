import prisma from ".";
import type { Prisma, UserPermissionRole } from "@prisma/client";
import { hashPassword } from "@quillsocial/features/auth/lib/hashPassword";
import { MembershipRole } from "@quillsocial/prisma/enums";

async function createUser(opts: {
  user: {
    email: string;
    password: string;
    username: string;
    name: string;
    completedOnboarding?: boolean;
    timeZone?: string;
    role?: UserPermissionRole;
  };
}) {
  const userData = {
    ...opts.user,
    password: await hashPassword(opts.user.password),
    emailVerified: new Date(),
    completedOnboarding: opts.user.completedOnboarding ?? true,
    locale: "en",
  };

  const user = await prisma.user.upsert({
    where: {
      email_username: { email: opts.user.email, username: opts.user.username },
    },
    update: userData,
    create: userData,
  });

  console.log(
    `👤 Upserted '${opts.user.username}' with email "${opts.user.email}" & password "${opts.user.password}". Booking page 👉 ${process.env.NEXT_PUBLIC_WEBAPP_URL}/${opts.user.username}`
  );

  return user;
}

async function createTeamAndAddUsers(
  teamInput: Prisma.TeamCreateInput,
  users: { id: number; username: string; role?: MembershipRole }[]
) {
  const createTeam = async (team: Prisma.TeamCreateInput) => {
    try {
      return await prisma.team.create({
        data: {
          ...team,
        },
      });
    } catch (_err) {
      if (
        _err instanceof Error &&
        _err.message.indexOf("Unique constraint failed on the fields") !== -1
      ) {
        console.log(`Team '${team.name}' already exists, skipping.`);
        return;
      }
      throw _err;
    }
  };

  const team = await createTeam(teamInput);
  if (!team) {
    return;
  }

  console.log(
    `🏢 Created team '${teamInput.name}' - ${process.env.NEXT_PUBLIC_WEBAPP_URL}/team/${team.slug}`
  );

  for (const user of users) {
    const { role = MembershipRole.OWNER, id, username } = user;
    await prisma.membership.create({
      data: {
        teamId: team.id,
        userId: id,
        role: role,
        accepted: true,
      },
    });
    console.log(
      `\t👤 Added '${teamInput.name}' membership for '${username}' with role '${role}'`
    );
  }
}

async function main() {

  await createUser({
    user: {
      email: "admin@quillsocial.com",
      /** To comply with admin password requirements  */
      password: "ADMIN@@admin25!",
      username: "admin",
      name: "Admin Example",
      role: "ADMIN",
    },
  });
}

main()
  //   .then(() => mainAppStore())
  .then(() => {})
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
