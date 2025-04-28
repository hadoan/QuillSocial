import React from "react";

import InputArticlePost from "./inputArticlePost";
import InputBookLearnings from "./inputBookLearnings";
import InputFavouriteTool from "./inputFavouriteTool";
import InputFormatContent from "./inputFormatContent";
import InputRecentLearning from "./inputRecentLearning";
import InputShareStruggle from "./inputShareStruggle";
import InputShareTips from "./inputShareTips";
import InputStartScratch from "./inputStartScratch";

export interface InputData {
  countInput: number;
  input: { id: string; value: string }[];
}
export interface InputTemplateProps {
  onInputData?: (data: InputData) => void;
}

type InputTemplateComponent = React.FC<InputTemplateProps>;

const InputTemplateCustom: React.FC<{ number: number; onInputData?: (data: InputData) => void }> = ({
  number,
  onInputData,
}) => {
  const components: { [key: number]: InputTemplateComponent } = {
    1: InputStartScratch,
    2: InputArticlePost,
    3: InputBookLearnings,
    4: InputShareTips,
    5: InputRecentLearning,
    6: InputFavouriteTool,
    7: InputShareStruggle,
    8: InputFormatContent,
  };

  const SelectedInput = components[number] || InputStartScratch;

  return <SelectedInput onInputData={onInputData} />;
};
export const templatesInfo = [
  {
    id: 1,
    code: "from-scratch",
    title: "Start from scratch",
    subtitle: "Generate Post from Scratch",
    description: "Use the power of AI-generated content to create impactful LinkedIn posts.",
    isNew: true,
    backgroundColor: "#94ecff",
  },
  {
    id: 2,
    code: "from-article",
    title: "Article to LinkedIn Post",
    subtitle: "Generate a post from an article",
    description: "Share a link to a blog post and generate a post from it",
    isNew: false,
    backgroundColor: "#fffbb5",
  },
  {
    id: 3,
    code: "book-learning",
    title: "Share learnings from a book",
    subtitle: "Share your learnings from a book",
    description: "Share the learnings from a book and let AI create a post for you.",
    isNew: false,
    backgroundColor: "#87ceeb",
  },
  {
    id: 4,
    code: "valuable-tips",
    title: "Share valuable tips",
    subtitle: "Share tips on your topic of interest",
    description: "Share the tips on your topic of interest and let AI create a post for you.",
    isNew: false,
    backgroundColor: "#90ee90",
  },
  {
    id: 5,
    code: "recent-learning",
    title: "Share your recent learning",
    subtitle: "Share your recent learning",
    description: "Share the details of your recent learning and let AI create a post for you.",
    isNew: false,
    backgroundColor: "#fac49d",
  },
  {
    id: 6,
    code: "favourite-tool",
    title: "Share your favourite tool",
    subtitle: "Share your favourite tool",
    description: "Share the details of your favourite tool and let AI create a post for you.",
    isNew: false,
    backgroundColor: "#add8e6",
  },
  {
    id: 7,
    code: "struggle",
    title: "Share your struggle",
    subtitle: "Share your recent struggle",
    description: "Share the details of your recent struggle and let AI create a post for you.",
    isNew: false,
    backgroundColor: "#ffcc99",
  },
  {
    id: 8,
    code: "format-content",
    title: "Format your content",
    subtitle: "Format your content",
    description: "Use the power of AI to format your clunky content into readable posts",
    isNew: false,
    backgroundColor: "#f0e68c",
  },
];

export const emotionsStartScratch = [
  { id: 1, name: "Excited", icon: "😃" },
  { id: 2, name: "Professional", icon: "💼" },
  { id: 3, name: "Encouraging", icon: "💪" },
  { id: 4, name: "Funny", icon: "😄" },
  { id: 5, name: "Dramatic", icon: "🎭" },
  { id: 6, name: "Candid", icon: "📸" },
  { id: 7, name: "Casual", icon: "👕" },
  { id: 8, name: "Convincing", icon: "🤝" },
  { id: 9, name: "Urgent", icon: "⏰" },
  { id: 10, name: "Engaging", icon: "💡" },
  { id: 11, name: "Creative", icon: "🎨" },
  { id: 12, name: "Worried", icon: "😟" },
  { id: 13, name: "Passionate", icon: "❤️" },
  { id: 14, name: "Informative", icon: "📚" },
];
export const getIdFromCode = (code: string) => {
  const template = templatesInfo.find((template) => template.code === code);
  return template ? template.id : -1;
};
export default InputTemplateCustom;
