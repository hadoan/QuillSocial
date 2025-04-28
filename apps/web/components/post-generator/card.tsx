import React from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  description?: string;
  isNew?: boolean;
  backgroundColor?: string;
}

const Card: React.FC<CardProps> = ({ title, subtitle, description, isNew, backgroundColor }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || "",
    maxWidth: "250px",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column" as "column",
    transition: "transform 0.3s ease-in-out",
  };

  const contentStyle: React.CSSProperties = {
    flex: "1",
    padding: "1rem",
    maxHeight: "calc(100% - 40px)",
    overflow: "hidden",
  };

  const hoverCardStyle: React.CSSProperties = {
    transform: "translateY(-10px)",
    cursor: "pointer",
  };

  const titleColor = getContrastColor(backgroundColor || "");

  function getContrastColor(hexColor: string): string {
    const hex = hexColor.replace(/^#/, "");
    const red = parseInt(hex.substring(0, 2), 16);
    const green = parseInt(hex.substring(2, 4), 16);
    const blue = parseInt(hex.substring(4, 6), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg"
      style={cardStyle}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-10px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}>
      <div className="my-4 flex h-20 items-center justify-center">
        <h3 className="mb-1 text-lg font-bold " style={{ color: titleColor }}>
          {title}
        </h3>
      </div>
      {isNew && (
        <span className="absolute right-2 top-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
          New
        </span>
      )}
      <div className="bg-white bg-opacity-80 p-4" style={contentStyle}>
        <center>
          <h4 className="text-base font-semibold leading-5 text-gray-950">{subtitle}</h4>
        </center>
        <p className="mt-2 text-sm font-normal text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default Card;
