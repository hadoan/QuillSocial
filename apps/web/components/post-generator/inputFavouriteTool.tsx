import React from "react";
import { useState, useEffect } from "react";

import { TextAreaField, InputField, TextField } from "@quillsocial/ui";

import { InputTemplateProps } from "./constTemplateWrapper";

const InputFavouriteTool: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [favoriteTool, setFavoriteTool] = useState("");
  const [reasonForNecessity, setReasonForNecessity] = useState("");

  const handleFavoriteToolChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFavoriteTool(event.target.value);
  };

  const handleReasonForNecessityChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setReasonForNecessity(event.target.value);
  };

  useEffect(() => {
    if (
      favoriteTool !== null &&
      favoriteTool !== undefined &&
      reasonForNecessity !== null &&
      reasonForNecessity !== undefined &&
      onInputData
    ) {
      onInputData({
        countInput: 2,
        input: [
          { id: "favoriteTool", value: favoriteTool },
          { id: "reasonForNecessity", value: reasonForNecessity },
        ],
      });
    }
  }, [favoriteTool, reasonForNecessity]);

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What is your favourite tool?
        </label>
        <TextField
          autoFocus={true}
          id="favoriteTool"
          className="mt-2 w-full bg-slate-50"
          placeholder="slack"
          value={favoriteTool}
          onChange={handleFavoriteToolChange}
        />
      </div>
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Why can't you live without this tool?
        </label>
        <TextAreaField
          id="reasonForNecessity"
          name=""
          rows={2}
          placeholder="collaboration across team members"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={reasonForNecessity}
          onChange={handleReasonForNecessityChange}
        />
      </div>
    </div>
  );
};

export default InputFavouriteTool;
