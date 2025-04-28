import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { Button, HeadSeo } from "@quillsocial/ui";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { HorizontalTabs } from "@quillsocial/ui";
import type { VerticalTabItemProps, HorizontalTabItemProps } from "@quillsocial/ui";
import { useRouter } from "next/router";
import PageWrapper from "@components/PageWrapper";
import { Pencil, Trash, } from "lucide-react";
import dayjs from "@quillsocial/dayjs";
import { Dialog, DialogContent } from "@quillsocial/ui";
import useMeQuery from "@lib/hooks/useMeQuery";
import SocialAvatar from "@quillsocial/features/shell/SocialAvatar";

const tabs: (VerticalTabItemProps | HorizontalTabItemProps)[] = [
  {
    name: "Drafts",
    href: "/post/all",
    number: '0'
  },
  {
    name: "Posts",
    href: "/post/posted",
    number: '12'
  },
  {
    name: "Scheduled",
    href: "/post/scheduled",
    number: '4'
  },
];

interface Post {
  id: number;
  topic: string;
  content: string;
  avatarUrl?: string;
  emailOrUserName?: string;
  name?: string;
  credentialId?: number;
  createdDate?: Date;
  schedulePostDate?: Date;
}
const PostPage = () => {
  const { t } = useLocale();
  const router = useRouter();
  const [idea, setIdea] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [processedPosts, setProcessedPosts] = useState<Post[]>([]);
  const [credentialId, setCredentialId] = useState();

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

  return (
    <>
      <HeadSeo title={t("Posts")} description={""} />
      <Shell withoutSeo heading={`Posts`} title="Here are your Posts" hideHeadingOnMobile>
        <div className="w-[282px]">
          {" "}
          <HorizontalTabs tabs={tabs} />{" "}
        </div>
        <div className="pb-10">
          <div className="">
            <div className="mx-auto mb-5 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 mt-5 lg:mx-0 lg:max-w-none lg:grid-cols-4">
              {processedPosts.map((post) => (
                <article
                  key={post?.id}
                  className="cursor-pointer relative isolate flex flex-col overflow-hidden rounded-2xl bg-white px-8 py-8  shadow ">
                  <div className="-ml-4 flex items-center gap-x-4">
                    <svg viewBox="0 0 2 2" className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <div className="flex gap-x-2.5">
                      <img
                        src={post.avatarUrl}
                        alt=""
                        className="h-8 w-8 flex-none rounded-full bg-white/10"
                      />

                      <div className="mt-[5px]">
                        <p className="text-sm font-bold">{post.name}</p>
                      </div>
                    </div>
                  </div>
                  {(router.query.page === "scheduled") ? (<div className="text-[13px] mt-[5px] leading-6 text-awst">
                    <span>Published on: {dayjs(post.schedulePostDate).format('YYYY-MM-DD HH:mm')}</span>
                  </div>) : <div className="mt-[5px] flex flex-col">
                    <p className="text-[13px]">{" Last edited Dec 29, 2023, 11:34 AM•"}</p>
                    <p className="text-[13px]">{"566 characters"}</p>
                  </div>
                  }
                  <h3 className="mt-3 text-left text-sm h-[120px] overflow-y-auto">
                    <a>
                      <span className="absolute inset-0 text-left" />
                      {post.content}
                    </a>
                  </h3>
                  <div className="mt-auto ">
                    <div className="mt-3 flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-500">
                    </div>
                    <div className="mt-3 flex gap-[10px] pt-5">
                      <div className="flex flex-grow">
                      <Button onClick={()=>router.push(`/write/${post.id}}`)} className="w-full bg-white border hover:text-white text-dark flex rounded-lg justify-center items-center">
                          <Pencil className="h-[15px] w-[15px]" />
                      </Button>
                      </div>
                      <div className="flex flex-grow">
                        <Button className="w-full bg-white border hover:text-white text-dark flex rounded-lg justify-center items-center">
                          <Trash className="h-[15px] w-[15px]" />
                        </Button>
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
            </div>
          </div>
        </div>
      </Shell>
    </>
  );
};
PostPage.PageWrapper = PageWrapper;
export default PostPage;
