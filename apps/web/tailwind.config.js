const base = require("@quillsocial/config/tailwind-preset");
/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [...base.content, "../../node_modules/@tremor/**/*.{js,ts,jsx,tsx}"],
};
