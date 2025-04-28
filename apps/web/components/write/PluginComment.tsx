import { Smile } from "lucide-react";
import { EmojiDialog } from "./EmojiDialog";
import { TextArea, Input, Select } from "@quillsocial/ui";
import { useState } from "react";
import { TimeType } from "@quillsocial/prisma/enums";
interface PluginProps {
  isModalEmoji: boolean;
  setIsModalEmoji: React.Dispatch<React.SetStateAction<boolean>>;
  onPluginAfterChange: (value: {
    time: string;
    timeType: string;
    comment: string;
  }) => void;
}

const Plugin: React.FC<PluginProps> = ({
  isModalEmoji,
  setIsModalEmoji,
  onPluginAfterChange,
}) => {
  const timeTypeOption = [
    { label: "Minute", value: TimeType.MINUTE as string },
    { label: "Hour", value: TimeType.HOUR as string },
  ];
  const [comment, setComment] = useState("");
  const [selectedTimeType, setSelectedTimeType] = useState(
    timeTypeOption[0].value
  );
  const [time, setTime] = useState("10");

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    onPluginAfterChange({ time: newTime, timeType: selectedTimeType, comment });
  };

  const handleTimeTypeChange = (selectedOption: { value: string }) => {
    setSelectedTimeType(selectedOption.value);
    onPluginAfterChange({ time, timeType: selectedOption.value, comment });
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
    onPluginAfterChange({
      time,
      timeType: selectedTimeType,
      comment: newComment,
    });
  };

  const handleEmojiSelect = (emoji: string | null) => {
    if (emoji) {
      const newComment = comment + emoji;
      setComment(newComment);
      onPluginAfterChange({
        time,
        timeType: selectedTimeType,
        comment: newComment,
      });
    }
  };

  return (
    <div className="flex pl-[50px] text-sm justify-start items-start flex-col">
      <p className="mt-2 font-medium">Comment</p>
      <TextArea
        className="editor mt-1"
        name="comment"
        placeholder="Add your comment here ..."
        style={{ height: "100px", backgroundColor: "white", maxWidth: "95%" }}
        value={comment}
        onChange={handleCommentChange}
      />
      <div>
        <button
          data-tooltip-id="emoji"
          onClick={() => setIsModalEmoji(true)}
          className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
        >
          <Smile />
        </button>
      </div>
      <div className="flex gap-2">
        <span className="mt-2 font-medium">Post after</span>
        <Input
          defaultValue={time}
          type="number"
          className="w-[80px]"
          onChange={handleTimeChange}
        />
        <Select
          className="w-[100px]"
          defaultValue={timeTypeOption[0]}
          options={timeTypeOption}
          onChange={(selectedOption: any) =>
            handleTimeTypeChange(selectedOption as { value: string })
          }
        />
      </div>
      <EmojiDialog
        open={isModalEmoji}
        onClose={() => setIsModalEmoji(false)}
        onSelectEmoji={handleEmojiSelect}
      />
    </div>
  );
};

export default Plugin;
