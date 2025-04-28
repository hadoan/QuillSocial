import React from "react";
import { useState, useEffect } from "react";

import { TextAreaField, InputField, TextField } from "@quillsocial/ui";

import { InputTemplateProps } from "./constTemplateWrapper";

const InputArticlePost: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [url, setUrl] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleInstructionsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInstructions(event.target.value);
  };

  useEffect(() => {
    if (
      url !== null &&
      url !== undefined &&
      instructions !== null &&
      instructions !== undefined &&
      onInputData
    ) {
      onInputData({
        countInput: 2,
        input: [
          { id: "url", value: url },
          { id: "instructions", value: instructions },
        ],
      });
    }
  }, [url, instructions]);

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <span className="block text-sm font-medium leading-6 text-gray-900">
          {
            "Blog post URL(the URL content should be open and public), Currently, we don't support PDFs, Google Docs, LinkedIn URLs"
          }
        </span>
        <TextField
          id="url"
          autoFocus={true}
          className="mt-2 w-full bg-slate-50"
          placeholder="https://www.example.com/blog-post"
          value={url}
          onChange={handleUrlChange}
        />
        <span className="block text-sm font-medium leading-6 text-gray-900">
          Add your instructions
        </span>
        <TextAreaField
          id="instructions"
          name=""
          rows={3}
          placeholder="focus on a specific part of the blog"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={instructions}
          onChange={handleInstructionsChange}
        />
      </div>
    </div>
  );
};

export default InputArticlePost;
