import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Button, HeadSeo,showToast } from "@quillsocial/ui";
import { Mail } from "@quillsocial/ui/components/icon";
import { debounce } from "lodash";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { useEffect, useMemo, useState } from "react";
import { HorizontalTabs } from "@quillsocial/ui";
import { ChatProvider } from "@lib/hooks/Chat/ChatProvider";
import { BrainProvider } from "@lib/hooks/Chat/brain-provider";
import type { VerticalTabItemProps, HorizontalTabItemProps } from "@quillsocial/ui";
import { useRouter } from "next/router";
import PageWrapper from "@components/PageWrapper";
import { Heart, MessageCircle, MessageSquare, MessagesSquare, Search, UsersIcon } from "lucide-react";
import dayjs from "@quillsocial/dayjs";
import { Dialog, DialogContent } from "@quillsocial/ui";
import useMeQuery from "@lib/hooks/useMeQuery";
import SocialAvatar from "@quillsocial/features/shell/SocialAvatar";
import { DeletePostDialog } from "@components/write/DeletePostDialog";
import { Tooltip as ReactTooltip } from "react-tooltip";

const tabs: (VerticalTabItemProps | HorizontalTabItemProps)[] = [
  {
    name: "Draft Posts",
    href: "/my-content/all",
  },
  {
    name: "Posted",
    href: "/my-content/posted",
  },
  {
    name: "Scheduled",
    href: "/my-content/scheduled",
  },
  {
    name: "Error",
    href: "/my-content/error",
  }
];

interface Post {
  id: number;
  topic: string;
  content: string;
  image?:string;
  avatarUrl?: string;
  emailOrUserName?: string;
  name?: string;
  credentialId?: number;
  createdDate?: Date;
  schedulePostDate?: Date;
}
const MyContentPage = () => {
  const { t } = useLocale();
  const router = useRouter();
  const [idea, setIdea] = useState("all");
  const [nameMenu, setnameMenu] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processedPosts, setProcessedPosts] = useState<Post[]>([]);
  const [credentialId, setCredentialId] = useState();
  const [isModalDeletePost, setIsModalDeletePost] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<number>(0);

  const query = useMeQuery();
  const user = query.data;

  useEffect(() => {
    setCredentialId(user?.currentSocialProfile?.credentialId);
  }, [user?.currentSocialProfile?.credentialId]);

  useEffect(() => {
    setIdea(router.query.page as string || 'all');
  }, [router.query.page]);

  useEffect(() => {
    generatePosts();
  }, [idea, credentialId]);

  const generatePosts = async () => {
    if (credentialId) {
      setIsLoading(true);
      const response = await fetch(`/api/my-content/getContent?idea=${idea}&credentialId=${credentialId}`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (typeof data === "object" && data !== null) {
        if (Array.isArray(data)) {
          const processedPosts = data.map((x: any) => {
            return {
              id: x.id,
              topic: x.idea,
              content: x.content,
              image:x.imagesDataURL,
              avatarUrl: x.credential?.avatarUrl,
              name: x.credential?.name,
              emailOrUserName: x.credential?.emailOrUserName,
              credentialId: x.credential?.id,
              createdDate: x.createdDate,
              schedulePostDate: x.schedulePostDate
            };
          });
          setProcessedPosts(processedPosts);
          setIsLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    const getPageName = () => {
      switch (router.query.page) {
        case "all":
          return t("All Posts");
        case "posted":
          return t("Posted");
        case "scheduled":
          return t("Scheduled");
        case "error":
          return t("Error Posts");
        default:
          return "";
      }
    };
    setnameMenu(getPageName());
  }, [router.query.page]);
  const handleOpenDeleteModal = (postId: number) => {
    setPostIdToDelete(postId);
    setIsModalDeletePost(true);
  };
  return (
    <>
      <HeadSeo title={t("My-Content")} description={""} />
      <Shell withoutSeo heading={`${nameMenu}`} hideHeadingOnMobile>
        <div className="w-[300px]">
          {" "}
          <HorizontalTabs tabs={tabs} />{" "}
        </div>
        <div className="pb-10">
          <div className="">
            <div className="mx-auto mb-5 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 mt-5 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {processedPosts.map((post) => (
                <article
                  key={post?.id}
                  //   onClick={() => openSlideOverWithData(post)}
                  onClick={() => router.query.page === 'error' && router.push(`/write/${post?.id}`)}
                  className={`relative isolate flex flex-col overflow-hidden rounded-2xl bg-white px-8 py-8 shadow ${router.query.page === 'error' ? 'cursor-pointer' : ''}`}
                >
                  {router.query.page === 'all' || router.query.page === 'scheduled' ? (
                 <> 
                 <div
                 onClick={() => handleOpenDeleteModal(post.id)}
                 className="relative hover:text-[18px] font-bold h-5 w-5 hover:cursor-pointer text-red-500 ml-auto mr-[-20px] mt-[-20px]">
                  X
                 </div>
                 </>  
                  ) : null}
                  <div className="-ml-4 flex items-center gap-x-4">
                    <svg viewBox="0 0 2 2" className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <div className="flex gap-x-2.5">
                    <SocialAvatar size="mdLg" appId={user?.currentSocialProfile?.appId}
                       avatarUrl={user?.currentSocialProfile?.avatarUrl} />
                     {/* <img
                        src={post.avatarUrl}
                        alt=""
                        className="h-12 w-12 flex-none rounded-full bg-white/10"
                      /> */}
                      <div className="mt-[7px] text-xs">
                        <p className="font-bold">{post.name}</p>
                        <p className="text-gray-500">@{post.emailOrUserName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-left text-sm max-h-[250px] overflow-y-auto">
                    <span className="" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }} />
                    {post.image && <img src={post.image}/> }  
                  </div>
                  <div className="mt-auto ">
                    <div className="mt-3 flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-500">
                      <time dateTime="2023-03-16" className="mr-8">
                        {dayjs(post.createdDate).format('YYYY-MM-DD HH:mm')}
                      </time>
                    </div>
                    {router.query.page === "scheduled" &&
                      <div className="text-sm leading-6 text-awst">
                        <span>Scheldule: {dayjs(post.schedulePostDate).format('YYYY-MM-DD HH:mm')}</span>
                      </div>
                    }
                    <div className="mt-3 flex gap-[10px] border-t pt-5">
                      <div className="flex">
                        <button>
                          <img className="w-[90%] h-[90%]" src={WEBAPP_URL + "/LikeGroup.svg"} alt="" />
                        </button>
                        <div className="-ml-1">99</div>
                      </div>
                      <div className="flex">
                        <button>
                          <img className="w-4 h-4 -mt-[1px] mr-1" src={WEBAPP_URL + "/comment_icon.svg"} alt="" />
                        </button>
                        <div>630</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <Dialog open={isLoading}>
                    <DialogContent>
                      <div className="text-center">
                        <svg
                          className="bg-awst text-awst mx-auto mb-3 h-8 w-8 animate-spin"
                          viewBox="0 0 24 24"></svg>
                        <p className="text-default ml-2 text-[16px]">Loading...</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              <DeletePostDialog
                    open={isModalDeletePost}
                    onClose={() => setIsModalDeletePost(false)}
                    id={postIdToDelete}
                    onDeleteComplete={(success) => {
                      if (success) {
                        showToast("Post has been deleted", "success");
                        setIsModalDeletePost(false);
                        router.reload();
                      } else {
                        showToast("Failed to delete post", "error");
                      }
                    }}
                  />
            </div>
          </div>
        </div>
      </Shell>
    </>
  );
};
MyContentPage.PageWrapper = PageWrapper;
export default MyContentPage;
