import {
  Dialog,
  DialogContent,
  DialogFooter,
  VideoPlayer,
} from "@quillsocial/ui";
import { Button } from "@quillsocial/ui";
import { uploadVideoGcp } from "@quillsocial/ui";
import { Upload } from "@quillsocial/ui/components/icon";
import { useEffect, useState } from "react";

interface UploadVideiDialogProps {
  open: boolean;
  onClose: (fileInfo: any) => Promise<void>;
}

export const UploadVideoDialog: React.FC<UploadVideiDialogProps> = ({
  open,
  onClose,
}) => {
  const [canUseVideo, setCanUseVideo] = useState(false);
  const [fileInfo, setFileInfo] = useState<any>(undefined);
  const [signedUrl, setSignedUrl] = useState("");

  useEffect(() => {
    // Fetch the signed URL when the component mounts
    if (!fileInfo || !fileInfo.cloudFileId) return;
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
    <Dialog open={open}>
      <DialogContent className="w-full max-w-xl">
        <div className="flex w-full justify-end">
          <div
            onClick={async () => {
              await onClose(false);
            }}
            className="mr-[-23px] mt-[-25px] flex h-[40px] w-[40px] items-center justify-center rounded-full border-none bg-white text-center text-red-700 hover:cursor-pointer hover:border-none hover:bg-red-100 focus:border-none"
          >
            &times;
          </div>
        </div>
        <div className="mt-4">
          <span className="mb-2 block text-sm font-semibold text-gray-700">
            Upload a Video
          </span>
          <div className="flex flex-col items-center justify-center rounded-lg  border border-gray-300 bg-slate-50 p-4">
            <Button
              className="text-dark mb-2 bg-slate-50 hover:text-white"
              onClick={() => {
                document?.getElementById("fileUploadHelper")?.click();
              }}
            >
              <Upload />{" "}
            </Button>
            <input
              id="fileUploadHelper"
              type="file"
              accept="application/mp4"
              onChange={async (event: any) => {
                await uploadVideoGcp(event, (result) => {
                  setFileInfo(result);
                  if (result) {
                    setCanUseVideo(true);
                  }
                });
              }}
              hidden
            />
            <span className="text-awst block text-xs  font-bold">
              Click to upload Video
            </span>
            <span className="block text-xs text-gray-500">
              Only MP4 Video file is supported. (The maximum size per file is
              200MB)
            </span>
          </div>

          <span className="mb-2 block text-sm font-semibold text-gray-700 ">
            {signedUrl && (
              <>
                <div className="flex overflow-y-auto h-96">
                  <VideoPlayer url={signedUrl}></VideoPlayer>
                </div>
              </>
            )}
          </span>
        </div>
        <DialogFooter className="flex justify-end">
          <Button
            className="rounded-xl"
            disabled={!canUseVideo}
            onClick={async () => await onClose(fileInfo)}
          >
            Use Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
