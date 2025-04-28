import React from "react";
import { useState, useEffect } from "react";

import { TextAreaField, InputField, TextField } from "@quillsocial/ui";

import { InputTemplateProps } from "./constTemplateWrapper";

const InputFormatContent: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [content, setContent] = useState("");

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContent(event.target.value);
  };
  useEffect(() => {
    if (content !== null && content !== undefined && onInputData) {
      onInputData({
        countInput: 1,
        input: [{ id: "content", value: content }],
      });
    }
  }, [content]);

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <label className=" text-sm font-medium leading-6 text-gray-900">
          Add your content
        </label>
        <TextAreaField
          autoFocus={true}
          id="content"
          name=""
          rows={6}
          placeholder="paste your content"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
};

export default InputFormatContent;
