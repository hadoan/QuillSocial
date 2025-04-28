import type { PrismaClient } from "@quillsocial/prisma/client";
import type { IncomingMessage } from "http";
import type { Session } from "next-auth";

import "./next-auth";

export declare module "next" {
  interface NextApiRequest extends IncomingMessage {
    // args is defined by /integrations/[...args] endpoint
    query: Partial<{ [key: string]: string | string[] }> & { args: string[] };
    session?: Session | null;
    body: unkown;
    userId: number;
    method: string;
    prisma: PrismaClient;
    // session: { user: { id: number } };
    // query: Partial<{ [key: string]: string | string[] }>;
    isAdmin: boolean;
    isCustomPrisma: boolean;
    pagination: { take: number; skip: number };
  }
}
