// components/VideoPlayer.js
import ReactPlayer from "react-player";

export const VideoPlayer = ({ url }: { url: string }) => {
  return (
    <div>
      <ReactPlayer url={url} controls width="100%" height="auto" />
    </div>
  );
};

