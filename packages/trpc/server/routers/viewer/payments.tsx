import appStore from "@quillsocial/app-store";
import dayjs from "@quillsocial/dayjs";
import { sendNoShowFeeChargedEmail } from "@quillsocial/emails";
import { getTranslation } from "@quillsocial/lib/server/i18n";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import authedProcedure from "../../procedures/authedProcedure";
import { router } from "../../trpc";

export const paymentsRouter = router({
  chargeCard: authedProcedure
    .input(
      z.object({
        bookingId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      try {
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error processing payment with error ${err}`,
        });
      }
    }),
});
