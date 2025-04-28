import React from "react";
import { useState, useEffect } from "react";

import { TextAreaField, TextField } from "@quillsocial/ui";

import { InputTemplateProps, emotionsStartScratch } from "./constTemplateWrapper";

const InputStartScratch: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("");
  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleEmotionSelect = (emotionName: string) => {
    setEmotion(emotionName);
  };

  useEffect(() => {
    if (
      content !== null &&
      content !== undefined &&
      emotion !== null &&
      emotion !== undefined &&
      onInputData
    ) {
      onInputData({
        countInput: 2,
        input: [
          { id: "content", value: content },
          { id: "emotion", value: emotion },
        ],
      });
    }
  }, [content, emotion]);

  return (
    <>
      <div className="p-2 text-sm">
        What do you want to post about?
        <TextAreaField
          autoFocus={true}
          id="content"
          name="content"
          rows={3}
          placeholder="Describe what you want to write..."
          label=""
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={content}
          onChange={handleContentChange}
        />
      </div>
      <div className="flex flex-col p-2">
        <div className="text-sm"> Select your Tone of Voice</div>
        <div className="flex flex-wrap">
          <EmotionButtons onEmotionSelect={handleEmotionSelect} />
        </div>
      </div>
    </>
  );
};

const EmotionButtons = ({ onEmotionSelect }: { onEmotionSelect: any }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<number | undefined>();
  const handleButtonClick = (emotion: { id: number; name: string; icon: string }) => {
    setSelectedEmotion(emotion.id);
    if (onEmotionSelect) {
      onEmotionSelect(emotion.name);
    }
  };

  return (
    <div className="flex flex-wrap">
      {emotionsStartScratch.map((emotion) => (
        <button
          key={emotion.id}
          onClick={() => handleButtonClick(emotion)}
          className={`m-2 flex items-center justify-center rounded-full border px-2 py-1 text-sm transition-all duration-300 
                        ${
                          selectedEmotion === emotion.id ? "border-blue-500 bg-blue-100" : "hover:bg-gray-100"
                        } 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}>
          <span className="mr-1">{emotion.icon}</span> {emotion.name}
        </button>
      ))}
    </div>
  );
};

export default InputStartScratch;
