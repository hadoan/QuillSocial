import React from "react";
import { useState, useEffect } from "react";

import { TextAreaField, InputField, TextField } from "@quillsocial/ui";

import { InputTemplateProps } from "./constTemplateWrapper";

const InputShareStruggle: React.FC<InputTemplateProps> = ({ onInputData }) => {
  const [feedback, setFeedback] = useState("");
  const [challenge, setChallenge] = useState("");
  const [overcomeMethod, setOvercomeMethod] = useState("");
  const [advice, setAdvice] = useState("");

  const handleFeedback = (reaction: string) => {
    setFeedback(reaction);
  };

  const handleChallengeChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setChallenge(event.target.value);
  };

  const handleOvercomeMethodChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setOvercomeMethod(event.target.value);
  };

  const handleAdviceChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAdvice(event.target.value);
  };

  useEffect(() => {
    if (
      challenge !== null &&
      challenge !== undefined &&
      overcomeMethod !== null &&
      overcomeMethod !== undefined &&
      advice !== null &&
      advice !== undefined &&
      onInputData
    ) {
      onInputData({
        countInput: 4,
        input: [
          { id: "challenge", value: challenge },
          { id: "overcomeMethod", value: overcomeMethod },
          { id: "feedback", value: feedback },
          { id: "advice", value: advice },
        ],
      });
    }
  }, [challenge, overcomeMethod, feedback, advice]);

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What recent challenge have you encountered?
        </label>
        <TextAreaField
          id="challenge"
          autoFocus={true}
          name=""
          rows={2}
          placeholder="writing a cold email, getting inbound leads"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={challenge}
          onChange={handleChallengeChange}
        />
      </div>
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          How did you overcome the challenge?
        </label>
        <TextAreaField
          id="overcomeMethod"
          name=""
          rows={2}
          placeholder="joined a webinar, experienced on own, got a reply from influencer"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={overcomeMethod}
          onChange={handleOvercomeMethodChange}
        />
      </div>
      <div className="p-2">
        <div className="space-x-2">
          <p className="mb-2 block text-sm font-medium leading-6 text-gray-900">
            What were your feelings about the process?
          </p>
          <button
            onClick={() => handleFeedback("frustrated")}
            className={`m-2 items-center justify-center rounded-full border p-2 px-2 py-1 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              feedback === "frustrated" ? "bg-awst text-white" : "bg-gray-200"
            }`}
            aria-label="Frustrated"
          >
            😠 Frustrated
          </button>
          <button
            onClick={() => handleFeedback("confused")}
            className={`m-2 items-center justify-center rounded-full border p-2 px-2 py-1 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              feedback === "confused" ? "bg-awst text-white" : "bg-gray-200"
            }`}
            aria-label="Confused"
          >
            😕 Confused
          </button>
        </div>
      </div>
      <div className="p-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          What advice would you like to share with your audience?{" "}
        </label>
        <TextAreaField
          id="advice"
          name=""
          rows={2}
          placeholder="sales lies in follow-up, start writing online to get inbound leads"
          className="w-95% disabled:bg-emphasis border bg-slate-50 pb-9 focus:border-none"
          required
          value={advice}
          onChange={handleAdviceChange}
        />
      </div>
    </div>
  );
};

export default InputShareStruggle;
