// @see: https://github.com/wojtekmaj/react-daterange-picker/issues/91
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "../../icon";
import "./styles.css";
import * as picker from "@wojtekmaj/react-daterange-picker";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import { Value } from "@wojtekmaj/react-daterange-picker/dist/cjs/shared/types";

type Props = {
  disabled?: boolean | undefined;
  startDate: Date;
  endDate: Date;
  onDatesChange?:
    | ((arg: { startDate: Date; endDate: Date }) => void)
    | undefined;
};

const DateRangePicker = ({
  disabled,
  startDate,
  endDate,
  onDatesChange,
}: Props) => {
  return (
    <>
      <picker.DateRangePicker
        disabled={disabled || false}
        className="border-default rounded-sm text-sm"
        clearIcon={null}
        calendarIcon={<Calendar className="text-subtle h-4 w-4" />}
        rangeDivider={
          <ArrowRight className="text-muted h-4 w-4 ltr:mr-2 rtl:ml-2" />
        }
        value={[startDate, endDate]}
        onChange={(value: any) => {
          if (typeof onDatesChange === "function" && value !== null) {
            onDatesChange({
              startDate: value[0],
              endDate: value[1],
            });
          }
        }}
        nextLabel={<ChevronRight className="text-subtle h-4 w-4" />}
        prevLabel={<ChevronLeft className="text-subtle h-4 w-4" />}
      />
    </>
  );
};

export default DateRangePicker;
