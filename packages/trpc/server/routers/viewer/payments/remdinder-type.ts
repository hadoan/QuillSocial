import dayjs from "@quillsocial/dayjs";
import ReminderDaysBilling from "@quillsocial/features/payments/ConstRemindDays"

export const getReminderType = (createdDate: Date, timeZone: string) => {
    const daysPastDue = calculateDaysPastDue(createdDate, timeZone);
    if (daysPastDue > ReminderDaysBilling.END_REMINDER) {
        return ReminderDaysBilling.END_REMINDER;
    } else if (daysPastDue > ReminderDaysBilling.SECOND_REMINDER) {
        return ReminderDaysBilling.SECOND_REMINDER;
    } else if (daysPastDue >= ReminderDaysBilling.FIRST_REMINDER) {
        return ReminderDaysBilling.FIRST_REMINDER;
    } else {
        return ReminderDaysBilling.NONE;
    }
};

export const getDayTrial = (createdDate: Date, timeZone: string) => {
    return calculateDaysPastDue(createdDate, timeZone);
};

const calculateDaysPastDue = (createdDate: Date, timeZone: string): number => {
    const currentDate = dayjs().utcOffset(timeZone);
    const targetDate = dayjs(createdDate).utcOffset(timeZone);
    const daysPastDueInSecond = currentDate.diff(targetDate, 'second');
    return daysPastDueInSecond / 86400;
  };