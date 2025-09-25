import { DeleteImageDialog } from "./DeleteImagePost";
import SocialAvatar from "@quillsocial/features/shell/SocialAvatar";
import { useCurrentUserAccount } from "@quillsocial/features/shell/SocialAvatar";
import { VideoPlayer } from "@quillsocial/ui";
import {
  Globe,
  MessagesSquare,
  Navigation,
  Redo,
  ThumbsUp,
} from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";

type PostPreviewProps = {
  name: string;
  content: string;
  likes: number;
  comments: number;
  reposts: number;
  isExpanded: boolean;
  toggleContent: () => void;
  contentStyle: React.CSSProperties;
  editorContent: string;
  imageSrc?: string;
  fileInfo?: any;
  onDelete: () => void;
};

export const PostPreview: React.FC<PostPreviewProps> = ({
  name,
  content,
  likes,
  comments,
  reposts,
  isExpanded,
  toggleContent,
  contentStyle,
  editorContent,
  imageSrc,
  fileInfo,
  onDelete,
}) => {
  const currentUser = useCurrentUserAccount();
  const dataContentLength = content ? content.length : 0;
  const editorContentLength = editorContent ? editorContent.length : 0;
  const showToggleButton = dataContentLength > 100 || editorContentLength > 100;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState("");

  useEffect(() => {
    if (!fileInfo || !fileInfo.cloudFileId) return;
    // Fetch the signed URL when the component mounts
    const fetchSignedUrl = async () => {
      try {
        const response = await fetch(
          `/api/integrations/googlecloudstorage/get?file=${fileInfo?.cloudFileId}.${fileInfo?.fileExt}`
        );
        const data = await response.json();
        setSignedUrl(data.signedUrl);
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };

    fetchSignedUrl();
  }, [fileInfo]);

  return (
    <div
      className="w-full rounded-lg bg-white p-5 shadow-lg"
      style={contentStyle}
    >
      <div className="mb-4 flex items-center space-x-3">
        {currentUser && (
          <div key={currentUser?.id}>
            <SocialAvatar
              size="mdLg"
              appId={currentUser?.appId!}
              avatarUrl={currentUser?.avatarUrl!}
            />
          </div>
        )}
        <div>
          <div className="font-medium">{currentUser?.name}</div>
          <div className="text-sm text-gray-500">
            <div className="flex items-center">
              <span>Now</span>
              <Globe className=" ml-2 h-[10px] w-[10px]" />
            </div>
          </div>
        </div>
      </div>
      <div
        className="mb-5"
        dangerouslySetInnerHTML={{
          __html:
            isExpanded || !editorContent || editorContent.length <= 100
              ? editorContent.replace(/\n/g, "<br />")
              : `${editorContent
                  .replace(/\n/g, "<br />")
                  .substring(0, 200)}...`,
        }}
      ></div>
      <div className="flex">
        {showToggleButton && (
          <button
            onClick={toggleContent}
            className="mb-5 ml-auto cursor-pointer text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? "see less" : "see more"}
          </button>
        )}
      </div>
      {imageSrc && (
        <>
          <div className="flex">
            <NextImage
              className="z-0 m-2"
              alt="Image"
              width={0}
              height={0}
              sizes="100vw"
              src={imageSrc}
              style={{ width: "auto", height: "250px" }}
            ></NextImage>
            <span
              onClick={() => setIsDeleteDialogOpen(true)}
              className="z-40 -ml-[45px] mt-3 h-8 w-8 rounded-full bg-slate-700 
          text-center text-xl text-white transition-opacity hover:cursor-pointer hover:bg-red-200 hover:text-red-600"
            >
              x
            </span>
          </div>
          <DeleteImageDialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={onDelete}
          />
        </>
      )}
      {signedUrl && (
        <>
          <div className="flex">
            <VideoPlayer url={signedUrl}></VideoPlayer>
          </div>
        </>
      )}

      <div className="flex flex-col">
        <div className="flex text-[13px] text-gray-500">
          <span className="mb-2 flex items-center">
            <img className="h-[90%] w-[90%]" src="/LikeGroup.svg"></img>{" "}
            <p className="ml-1">{likes}</p>
          </span>
          <span className="ml-auto">{comments} comments</span>
          <span className="ml-2">{reposts} repost</span>
        </div>
        <div className="flex gap-[8px] border-t pt-2 text-[13px]">
          <div className="-ml-2 flex flex-grow items-center justify-center rounded-xl p-1 hover:bg-slate-50">
            <ThumbsUp className="h-4 w-4 cursor-pointer" />
            <span className="ml-1">Like</span>
          </div>
          <div className="flex flex-grow items-center justify-center rounded-xl p-1 hover:bg-slate-50">
            <MessagesSquare className="h-4 w-4 cursor-pointer" />{" "}
            <span className="ml-2">Comment</span>
          </div>
          <div className="flex flex-grow items-center justify-center rounded-xl p-1 hover:bg-slate-50">
            <Redo className="h-4 w-4 cursor-pointer" />{" "}
            <span className="ml-2">Share</span>
          </div>
          <div className="flex flex-grow items-center justify-center rounded-xl p-1 hover:bg-slate-50">
            <Navigation className="h-4 w-4 cursor-pointer" />{" "}
            <span className="ml-1">Send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
