import dayjs from "@quillsocial/dayjs";
import { PeriodType } from "@quillsocial/prisma/enums";
import type { EventType } from "@prisma/client";

export class BookingDateInPastError extends Error {
  constructor(message = "Attempting to book a meeting in the past.") {
    super(message);
  }
}

function guardAgainstBookingInThePast(date: Date) {
  if (date >= new Date()) {
    // Date is in the future.
    return;
  }
  throw new BookingDateInPastError();
}

function isOutOfBounds(
  time: dayjs.ConfigType,
  {
    periodType,
    periodDays,
    periodCountCalendarDays,
    periodStartDate,
    periodEndDate,
  }: Pick<
    EventType,
    | "periodType"
    | "periodDays"
    | "periodCountCalendarDays"
    | "periodStartDate"
    | "periodEndDate"
  >
) {
  const date = dayjs(time);
  guardAgainstBookingInThePast(date.toDate());

  periodDays = periodDays || 0;

  switch (periodType) {
    case PeriodType.ROLLING: {
      const periodRollingEndDay = periodCountCalendarDays
        ? dayjs()
            .utcOffset(date.utcOffset())
            .add(periodDays, "days")
            .endOf("day")
        : (dayjs().utcOffset(date.utcOffset()) as any)
            .businessDaysAdd(periodDays)
            .endOf("day");
      return date.endOf("day").isAfter(periodRollingEndDay);
    }

    case PeriodType.RANGE: {
      const periodRangeStartDay = dayjs(periodStartDate)
        .utcOffset(date.utcOffset())
        .endOf("day");
      const periodRangeEndDay = dayjs(periodEndDate)
        .utcOffset(date.utcOffset())
        .endOf("day");
      return (
        date.endOf("day").isBefore(periodRangeStartDay) ||
        date.endOf("day").isAfter(periodRangeEndDay)
      );
    }

    case PeriodType.UNLIMITED:
    default:
      return false;
  }
}

export default isOutOfBounds;
