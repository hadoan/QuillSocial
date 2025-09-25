import useMeQuery from "@lib/hooks/useMeQuery";
import { router } from "@quillsocial/trpc/server/trpc";
import { Post } from "@quillsocial/types/Posts";
import { Dialog, DialogContent, DialogFooter, Button } from "@quillsocial/ui";
import { debounce } from "lodash";
import { Pencil } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { useEffect, useMemo, useState } from "react";

interface PickDraftDialogProps {
  open: boolean;
  onClose: () => void;
  onEditAndPost: (draft: { id: number; content: string }) => void;
}

export const PickDraftDialog: React.FC<PickDraftDialogProps> = ({
  open,
  onClose,
  onEditAndPost,
}) => {
  const [credentialId, setCredentialId] = useState();
  const [allDrafts, setAllDrafts] = useState<Post[]>([]);
  const query = useMeQuery();
  const user = query.data;
  const router = useRouter();
  useEffect(() => {
    if (
      user?.currentSocialProfile?.credentialId !== null &&
      user?.currentSocialProfile?.credentialId !== undefined
    ) {
      setCredentialId(user?.currentSocialProfile?.credentialId);
    }
  }, [user?.currentSocialProfile?.credentialId]);

  const debouncedApiCall = useMemo(() => {
    return debounce(async () => {
      if (credentialId !== null) {
        const response = await fetch(
          `/api/posts/getAll?credentialId=${credentialId}`,
          {
            credentials: "include",
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          console.error("Failed to get data");
        }
        const dataResponse = await response.json();
        if (typeof dataResponse === "object" && dataResponse !== null) {
          const { data } = dataResponse;
          const draftsFromDb = data?.map((x: any) => {
            return {
              id: x.id,
              content: x.content,
            };
          });
          setAllDrafts(draftsFromDb);
        }
      }
    }, 150);
  }, [credentialId]);

  useEffect(() => {
    if (credentialId !== null) {
      debouncedApiCall();
    }
  }, [debouncedApiCall, credentialId]);

  const handleEditAndPost = (draft: { id: number; content: string }) => {
    router.push(`/write/${draft.id}`);
    onEditAndPost(draft);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-xl min-h-[250px]">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="text-xl font-bold">Pick from Drafts</h2>
          <div
            onClick={onClose}
            className="rounded-full h-[40px] hover:cursor-pointer flex justify-center items-center text-center w-[40px] mr-[-23px] border-none hover:border-none focus:border-none mt-[-25px] hover:bg-red-100 bg-white text-red-700"
          >
            &times;
          </div>
        </div>
        <div
          className="mt-4 flex flex-wrap gap-4 overflow-auto"
          style={{ maxHeight: "400px" }}
        >
          {allDrafts?.map((draft) => (
            <div
              key={draft.id}
              className="p-4 flex border rounded-lg hover:bg-blue-50 w-full sm:w-[230px] flex-col justify-between border-b"
            >
              <p className="flex-1 break-words whitespace-normal">
                {draft.content}
              </p>
              <div className="border-t w-full border-slate-300 my-2 pt-3"></div>
              <Button
                onClick={() => handleEditAndPost(draft)}
                StartIcon={Pencil}
                className="mt-auto text-sm"
              >
                Edit & Post
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
