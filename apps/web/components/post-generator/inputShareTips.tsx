import React from "react";
import { useState, useEffect } from "react";

import { TextAreaField, InputField, TextField } from "@quillsocial/ui";

import { InputTemplateProps } from "./constTemplateWrapper";

const InputShareTips: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [nameTopic, setNameTopic] = useState("");
  const [tips, setTips] = useState("");

  const handleNameTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameTopic(event.target.value);
  };

  const handleTipsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTips(event.target.value);
  };

  useEffect(() => {
    if (nameTopic !== null && nameTopic !== undefined && tips !== null && tips !== undefined && onInputData) {
      onInputData({
        countInput: 2,
        input: [
          { id: "nameTopic", value: nameTopic },
          { id: "tips", value: tips },
        ],
      });
    }
  }, [nameTopic, tips]);

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">What is the topic?</label>
        <TextField
          autoFocus={true}
          id="nameTopic"
          className="mt-2 w-full bg-slate-50"
          placeholder="What is the topic?"
          value={nameTopic}
          onChange={handleNameTopicChange}
        />
      </div>
      <div className="p-2">
        {/* <label className='block text-sm font-medium leading-6 text-gray-900'>
                </label> */}
        <TextAreaField
          id="tips"
          name="What tips would you like to share with your audience?"
          rows={2}
          placeholder="content creation is crucial in personal branding"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={tips}
          onChange={handleTipsChange}
        />
      </div>
    </div>
  );
};

export default InputShareTips;
