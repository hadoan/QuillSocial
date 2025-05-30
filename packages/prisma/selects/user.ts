import { Prisma } from "@prisma/client";

export const availabilityUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  timeZone: true,
  bufferTime: true,
  startTime: true,
  username: true,
  endTime: true,
  timeFormat: true,
  defaultScheduleId: true,
});

export const baseUserSelect = Prisma.validator<Prisma.UserSelect>()({
  email: true,
  name: true,
  locale: true,
  hideBranding: true,
  theme: true,
  brandColor: true,
  darkBrandColor: true,
  ...availabilityUserSelect,
});

export const userSelect = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    name: true,
    allowDynamicBooking: true,
    locale: true,
    avatar: true,
    hideBranding: true,
    theme: true,
    brandColor: true,
    darkBrandColor: true,
    metadata: true,
    ...availabilityUserSelect,
  },
});
