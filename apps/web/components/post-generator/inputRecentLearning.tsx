import React from "react";
import { useState, useEffect } from "react";

import { TextAreaField, InputField, TextField } from "@quillsocial/ui";

import { InputTemplateProps } from "./constTemplateWrapper";

const InputRecentLearning: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [recentLearning, setRecentLearning] = useState("");
  const [learningMethod, setLearningMethod] = useState("");
  const [keyLearnings, setKeyLearnings] = useState("");

  const handleRecentLearningChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecentLearning(event.target.value);
  };

  const handleLearningMethodChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLearningMethod(event.target.value);
  };

  const handleKeyLearningsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeyLearnings(event.target.value);
  };

  useEffect(() => {
    if (
      recentLearning !== null &&
      recentLearning !== undefined &&
      learningMethod !== null &&
      learningMethod !== undefined &&
      keyLearnings !== null &&
      keyLearnings !== undefined &&
      onInputData
    ) {
      onInputData({
        countInput: 3,
        input: [
          { id: "recentLearning", value: recentLearning },
          { id: "learningMethod", value: learningMethod },
          { id: "keyLearnings", value: keyLearnings },
        ],
      });
    }
  }, [recentLearning, learningMethod, keyLearnings]);

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What did you learn recently?
        </label>
        <TextAreaField
          autoFocus={true}
          id="recentLearning"
          name=""
          rows={2}
          placeholder="how to write high converting cold emails"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={recentLearning}
          onChange={handleRecentLearningChange}
        />
      </div>
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">How did you learn it?</label>
        <TextAreaField
          id="learningMethod"
          name=""
          rows={2}
          placeholder="Found an interesting thread on Twitter"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={learningMethod}
          onChange={handleLearningMethodChange}
        />
      </div>
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What key learnings would you like to share with your audience?
        </label>
        <TextAreaField
          id="keyLearnings"
          name=""
          rows={2}
          placeholder="don't underestimate subject lines in cold email"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={keyLearnings}
          onChange={handleKeyLearningsChange}
        />
      </div>
    </div>
  );
};

export default InputRecentLearning;
