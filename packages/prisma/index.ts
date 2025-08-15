import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {};

if (!!process.env.NEXT_PUBLIC_DEBUG)
  prismaOptions.log = ["query", "error", "warn"];

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not defined at Prisma init. Database operations will fail until it is provided."
  );
}

const prismaMissingDbUrl = () => {
  throw new Error(
    "DATABASE_URL is not defined. Pass it at container runtime (e.g. docker run --env-file .env.production or -e DATABASE_URL=...)."
  );
};

export const prisma =
  globalThis.prisma ||
  (process.env.DATABASE_URL
    ? new PrismaClient(prismaOptions)
    : (new Proxy(
        {},
        {
          get() {
            prismaMissingDbUrl();
          },
          apply() {
            prismaMissingDbUrl();
          },
        }
      ) as unknown as PrismaClient));

export const customPrisma = (options: Prisma.PrismaClientOptions) =>
  new PrismaClient({ ...prismaOptions, ...options });

// if (process.env.NODE_ENV !== "production") {
globalThis.prisma = prisma;
// }
export default prisma;

export * from "./selects";
