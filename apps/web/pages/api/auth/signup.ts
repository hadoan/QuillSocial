import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import dayjs from "@quillsocial/dayjs";
import { hashPassword } from "@quillsocial/features/auth/lib/hashPassword";
import { sendEmailVerification } from "@quillsocial/features/auth/lib/verifyEmail";
import { sendToJuneSo, TrackEventJuneSo, EVENTS } from "@quillsocial/features/june.so/juneso";
import slugify from "@quillsocial/lib/slugify";
import prisma from "@quillsocial/prisma";
import { IdentityProvider } from "@quillsocial/prisma/enums";

import { publicDomain } from "./pulic-email";

const signupSchema = z.object({
  username: z.string().refine((value) => !value.includes("+"), {
    message: "String should not contain a plus symbol (+).",
  }),
  email: z.string().email(),
  password: z.string().min(7),
  language: z.string().optional(),
  token: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (process.env.NEXT_PUBLIC_DISABLE_SIGNUP === "true") {
    res.status(403).json({ message: "Signup is disabled" });
    return;
  }

  function isValidEmailDomain(email: string, blockedDomains: any) {
    const emailParts = email.split("@");
    const domain = emailParts[1];
    return blockedDomains.includes(domain);
  }

  function domainExists(emailToCheck: string, emailList: any) {
    for (const email of emailList) {
      const domain = email.email.split("@")[1];
      const emailcheck = emailToCheck.split("@")[1];
      if (domain === emailcheck) {
        return true;
      }
    }
    return false;
  }

  const data = req.body;
  const { email, password, language, token } = signupSchema.parse(data);

  const username = slugify(data.username);
  const userEmail = email.toLowerCase();

  if (!username) {
    res.status(422).json({ message: "Invalid username" });
    return;
  }

  let foundToken: { id: number; teamId: number | null; expires: Date } | null = null;
  if (token) {
    foundToken = await prisma.verificationToken.findFirst({
      where: {
        token,
      },
      select: {
        id: true,
        expires: true,
        teamId: true,
      },
    });

    if (!foundToken) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    if (dayjs(foundToken?.expires).isBefore(dayjs())) {
      return res.status(401).json({ message: "Token expired" });
    }
  } else {
    // There is an existingUser if the username matches
    // OR if the email matches AND either the email is verified
    // or both username and password are set

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          {
            AND: [
              { email: userEmail },
              {
                OR: [
                  { emailVerified: { not: null } },
                  {
                    AND: [{ password: { not: null } }, { username: { not: null } }],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    if (existingUser) {
      const message: string =
        existingUser.email !== userEmail ? "Username already taken" : "Email address is already registered";

      return res.status(409).json({ message });
    }

    const emailList = await prisma.user.findMany({
      select: {
        email: true,
      },
    });

    const checkdomain = isValidEmailDomain(userEmail, publicDomain);
    if (!checkdomain) {
      const isExists = domainExists(userEmail, emailList);
      if (isExists) {
        const message: string = "blocked";
        return res.status(409).json({ message });
      }
    }
  }

  const hashedPassword = await hashPassword(password);

  if (foundToken && foundToken?.teamId) {
    const team = await prisma.team.findUnique({
      where: {
        id: foundToken.teamId,
      },
    });

    if (team) {
      const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
          username,
          password: hashedPassword,
          emailVerified: new Date(Date.now()),
          identityProvider: IdentityProvider.DB,
        },
        create: {
          username,
          email: userEmail,
          password: hashedPassword,
          identityProvider: IdentityProvider.DB,
        },
      });

      // Accept any child team invites for orgs.
      if (team.parentId) {
        // Join ORG
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            organizationId: team.parentId,
          },
        });

        /** We do a membership update twice so we can join the ORG invite if the user is invited to a team witin a ORG. */
        await prisma.membership.updateMany({
          where: {
            userId: user.id,
            team: {
              id: team.parentId,
            },
            accepted: false,
          },
          data: {
            accepted: true,
          },
        });

        // Join any other invites
        await prisma.membership.updateMany({
          where: {
            userId: user.id,
            team: {
              parentId: team.parentId,
            },
            accepted: false,
          },
          data: {
            accepted: true,
          },
        });
      }
    }

    // Cleanup token after use
    await prisma.verificationToken.delete({
      where: {
        id: foundToken.id,
      },
    });
  } else {
    await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        username,
        password: hashedPassword,
        emailVerified: new Date(Date.now()),
        identityProvider: IdentityProvider.DB,
      },
      create: {
        username,
        email: userEmail,
        password: hashedPassword,
        identityProvider: IdentityProvider.DB,
      },
    });
    await sendEmailVerification({
      email: userEmail,
      username,
      language,
    });
  }

  const finduser = await prisma.user.findFirst({
    where: {
      email: userEmail,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (finduser) {
    const dataAPI = {
      id: finduser.id,
      email: finduser.email,
      first_name: finduser?.name || "New user",
      plan: "basic",
    };
    sendToJuneSo(dataAPI);
    TrackEventJuneSo({ id: finduser.id.toString(), event: EVENTS.SIGNED_UP });
  }

  res.status(201).json({ message: "Created user" });
}
