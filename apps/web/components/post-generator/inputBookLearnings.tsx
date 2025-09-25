import { InputTemplateProps } from "./constTemplateWrapper";
import { TextAreaField, InputField, TextField } from "@quillsocial/ui";
import React from "react";
import { useState, useEffect } from "react";

const InputBookLearnings: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [nameOfBook, setNameOfBook] = useState("");
  const [keyLearning, setKeyLearning] = useState("");
  const [quotesOfBook, setQuotesOfBook] = useState("");

  const handleNameOfBookChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNameOfBook(event.target.value);
  };

  const handleKeyLearningChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setKeyLearning(event.target.value);
  };

  const handleQuotesOfBookChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuotesOfBook(event.target.value);
  };

  useEffect(() => {
    if (
      nameOfBook !== null &&
      nameOfBook !== undefined &&
      keyLearning !== null &&
      keyLearning !== undefined &&
      quotesOfBook !== null &&
      quotesOfBook !== undefined &&
      onInputData
    ) {
      onInputData({
        countInput: 3,
        input: [
          { id: "nameOfBook", value: nameOfBook },
          { id: "keyLearning", value: keyLearning },
          { id: "quotesOfBook", value: quotesOfBook },
        ],
      });
    }
  }, [nameOfBook, keyLearning, quotesOfBook]);

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What is the name of the book?
        </label>
        <TextField
          id="nameOfBook"
          autoFocus={true}
          className="mt-2 w-full bg-slate-50"
          placeholder="Psychology of Money"
          value={nameOfBook}
          onChange={handleNameOfBookChange}
        />
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What are few key learnings from that book that you want to share with
          your audience?
        </label>
        <TextAreaField
          id="keyLearning"
          name=""
          rows={3}
          placeholder="Doing well with money has little to do with how smart you are and a lot to do with how you behave."
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={keyLearning}
          onChange={handleKeyLearningChange}
        />
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What quotes in the book resonated with you the most and why?
        </label>
        <TextField
          id="quotesOfBook"
          className="mt-2 w-full bg-slate-50"
          placeholder="Wealth is What You Don’t See"
          value={quotesOfBook}
          onChange={handleQuotesOfBookChange}
        />
      </div>
    </div>
  );
};

export default InputBookLearnings;
