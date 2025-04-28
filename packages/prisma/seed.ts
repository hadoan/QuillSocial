import type { Prisma, UserPermissionRole } from "@prisma/client";

import { hashPassword } from "@quillsocial/features/auth/lib/hashPassword";
import { MembershipRole } from "@quillsocial/prisma/enums";

import prisma from ".";

// import mainAppStore from "./seed-app-store";

async function createUserAndEventType(opts: {
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
    where: { email_username: { email: opts.user.email, username: opts.user.username } },
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
      if (_err instanceof Error && _err.message.indexOf("Unique constraint failed on the fields") !== -1) {
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
    console.log(`\t👤 Added '${teamInput.name}' membership for '${username}' with role '${role}'`);
  }
}

async function main() {
  await createUserAndEventType({
    user: {
      email: "delete-me@example.com",
      password: "delete-me",
      username: "delete-me",
      name: "delete-me",
    },
  });

  await createUserAndEventType({
    user: {
      email: "onboarding@example.com",
      password: "onboarding",
      username: "onboarding",
      name: "onboarding",
      completedOnboarding: false,
    },
  });

  await createUserAndEventType({
    user: {
      email: "free-first-hidden@example.com",
      password: "free-first-hidden",
      username: "free-first-hidden",
      name: "Free First Hidden Example",
    },
  });
  await createUserAndEventType({
    user: {
      email: "pro@example.com",
      name: "Pro Example",
      password: "pro",
      username: "pro",
    },
  });

  await createUserAndEventType({
    user: {
      email: "trial@example.com",
      password: "trial",
      username: "trial",
      name: "Trial Example",
    },
  });

  await createUserAndEventType({
    user: {
      email: "free@example.com",
      password: "free",
      username: "free",
      name: "Free Example",
    },
  });

  await createUserAndEventType({
    user: {
      email: "usa@example.com",
      password: "usa",
      username: "usa",
      name: "USA Timezone Example",
      timeZone: "America/Phoenix",
    },
  });

  const freeUserTeam = await createUserAndEventType({
    user: {
      email: "teamfree@example.com",
      password: "teamfree",
      username: "teamfree",
      name: "Team Free Example",
    },
  });

  const proUserTeam = await createUserAndEventType({
    user: {
      email: "teampro@example.com",
      password: "teampro",
      username: "teampro",
      name: "Team Pro Example",
    },
  });

  await createUserAndEventType({
    user: {
      email: "admin@example.com",
      /** To comply with admin password requirements  */
      password: "ADMINadmin2022!",
      username: "admin",
      name: "Admin Example",
      role: "ADMIN",
    },
  });

  const pro2UserTeam = await createUserAndEventType({
    user: {
      email: "teampro2@example.com",
      password: "teampro2",
      username: "teampro2",
      name: "Team Pro Example 2",
    },
  });

  const pro3UserTeam = await createUserAndEventType({
    user: {
      email: "teampro3@example.com",
      password: "teampro3",
      username: "teampro3",
      name: "Team Pro Example 3",
    },
  });

  const pro4UserTeam = await createUserAndEventType({
    user: {
      email: "teampro4@example.com",
      password: "teampro4",
      username: "teampro4",
      name: "Team Pro Example 4",
    },
  });

  await createTeamAndAddUsers(
    {
      name: "Seeded Team",
      slug: "seeded-team",

      createdAt: new Date(),
    },
    [
      {
        id: proUserTeam.id,
        username: proUserTeam.name || "Unknown",
      },
      {
        id: freeUserTeam.id,
        username: freeUserTeam.name || "Unknown",
      },
      {
        id: pro2UserTeam.id,
        username: pro2UserTeam.name || "Unknown",
        role: "MEMBER",
      },
      {
        id: pro3UserTeam.id,
        username: pro3UserTeam.name || "Unknown",
      },
      {
        id: pro4UserTeam.id,
        username: pro4UserTeam.name || "Unknown",
      },
    ]
  );
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
