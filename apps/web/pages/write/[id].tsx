import PageWrapper from "@components/PageWrapper";
import { AddImageDialog } from "@components/write/AddImageDialog";
import { DeletePostDialog } from "@components/write/DeletePostDialog";
import { DropdownReWriteAI } from "@components/write/DropdownReWriteAI";
import { EmojiDialog } from "@components/write/EmojiDialog";
import { FormatPostDialog } from "@components/write/FormatPostDialog";
import { PickDraftDialog } from "@components/write/PickDraftDialog";
import { PostNowDialog } from "@components/write/PostNowDialog";
import { PostPreview } from "@components/write/PostPreview";
import { PluginType } from "@components/write/ScheduleDialog";
import { ScheduleDialog } from "@components/write/ScheduleDialog";
import { TwitterCharacterLimitDialog } from "@components/write/TwitterCharacterLimitDialog";
import { UploadFileDialog } from "@components/write/UploadFileDialog";
import { UploadVideoDialog } from "@components/write/UploadFileVideo";
import { TrackEventJuneSo, EVENTS } from "@quillsocial/features/june.so/juneso";
import ModalUpgrade from "@quillsocial/features/payments/ModalUpgrade";
import Shell from "@quillsocial/features/shell/Shell";
import { ModalAccount } from "@quillsocial/features/shell/SocialAccountsDialog";
import SocialAvatar from "@quillsocial/features/shell/SocialAvatar";
import {
  useCurrentUserAccount,
  checkUserToUsePlug,
} from "@quillsocial/features/shell/SocialAvatar";
import { TWITTER_APP_ID } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import useMeQuery from "@quillsocial/trpc/react/hooks/useMeQuery";
import { Post } from "@quillsocial/types/Posts";
import { ReWriteAI } from "@quillsocial/types/ReWriteAI";
import { Editor as EditorCustom } from "@quillsocial/ui";
import {
  Button,
  HeadSeo,
  LoadingDialog,
  TextArea,
  showToast,
  Dialog,
  DialogContent,
} from "@quillsocial/ui";
import { Tablet, Laptop } from "@quillsocial/ui/components/icon";
import { debounce } from "lodash";
import { Smile } from "lucide-react";
import {
  Copy,
  AlignStartVertical,
  Image,
  Paperclip,
  Video,
  Twitter,
} from "lucide-react";
import { useRouter } from "next/router";
import { Editor } from "primereact/editor";
import { useState } from "react";
import { useEffect, useMemo } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

const DeviceType = {
  PHONE: "phone",
  TAB: "tab",
  PC: "pc",
};
const data = {
  avatarUrl: "/avatar-placeholder.png",
  name: "Ha Doan",
  content: "",
  title: "",
  likes: 88,
  comments: 4,
  reposts: 1,
};

const WritePage = () => {
  const { t } = useLocale();
  const [editorContent, setEditorContent] = useState(data.content);
  const [title, setTitle] = useState(data.title);
  const [activeDevice, setActiveDevice] = useState(DeviceType.PC);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalShowDay, setIsModalShowDay] = useState(false);
  const [isModalPostNow, setIsModalPostNow] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [isModalAddImage, setIsModalAddImage] = useState(false);
  const [isModalAddVideo, setIsModalAddVideo] = useState(false);
  const [isModalUploadFile, setIsModalUploadFile] = useState(false);
  const [isModalPickDraft, setIsModalPickDraft] = useState(false);
  const [isModalEmoji, setIsModalEmoji] = useState(false);
  const [credentialId, setCredentialId] = useState();
  const [pageId, setPageId] = useState();
  const [appId, setAppId] = useState(TWITTER_APP_ID);
  const [isButtonSaveDraft, setIsButtonSaveDraft] = useState(false);
  const [isModalFormatPost, setIsModalFormatPost] = useState(false);
  const [isModalDeletePost, setIsModalDeletePost] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [showModalAccounts, setShowModalAccounts] = useState(false);
  const [isModalUpgradeOpen, setIsModalUpgradeOpen] = useState(false);
  const [
    isTwitterCharacterLimitDialogOpen,
    setIsTwitterCharacterLimitDialogOpen,
  ] = useState(false);
  const [showTwitterDialog, setShowTwitterDialog] = useState(false);
  const [twitterCharacterCount, setTwitterCharacterCount] = useState(0);
  const [post, setPost] = useState<Post>({
    id: 0,
    idea: "",
    content: "",
    appId: TWITTER_APP_ID,
  });
  const { data: user } = useMeQuery();
  const [fileInfo, setFileInfo] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const { isLoading: ischeckForAIAppsLoading, data: isAIPresent } =
    trpc.viewer.appsRouter.checkForAIApps.useQuery();

  useEffect(() => {
    if (
      user?.currentSocialProfile?.credentialId !== null &&
      user?.currentSocialProfile?.credentialId !== undefined
    ) {
      setCredentialId(user?.currentSocialProfile?.credentialId);
      setPageId(user?.currentSocialProfile?.pageId);
    }
    setAppId(user?.currentSocialProfile?.appId!);
  }, [user?.currentSocialProfile?.credentialId]);

  const contentStyle = {
    width:
      activeDevice === DeviceType.PHONE
        ? "65%"
        : activeDevice === DeviceType.TAB
        ? "80%"
        : "100%",
    transition: "width 0.3s",
  };

  const router = useRouter();
  const { id } = router.query;
  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEditorChange = (e: any) => {
    setEditorContent(e.target.value);
  };
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*(>|$)/g, "");
  };

  const handleDeviceChange = (device: string) => {
    setActiveDevice(device);
  };

  const handleDateTimeChangeFromSchedule = (value: string) => {
    setSelectedDateTime(value);
  };

  const handleEditAndPostFromDialog = (draft: {
    id: number;
    content: string;
  }) => {
    setEditorContent(draft.content);
  };

  const handleSelectEmojiFromDialog = (emoji: string | null) => {
    if (emoji) {
      if (!editorContent) {
        setEditorContent(emoji);
      } else {
        setEditorContent(editorContent + emoji);
      }
    }
  };
  const handleCopyToWritePage = (content: string) => {
    setEditorContent(content);
  };

  const debouncedApiCall = useMemo(() => {
    return debounce(async (id) => {
      if (credentialId !== null) {
        const response = await fetch(
          `/api/posts/getPostById?credentialId=${credentialId}&id=${id}`,
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
          return;
        }

        const dataResponse = await response.json();
        if (dataResponse !== null) {
          const { data } = dataResponse;
          if (data !== null) {
            const postFromDb = {
              id: data.id || 0,
              topic: data.idea || "",
              title: data.title || "",
              content: data.content || "",
              avatarUrl: data.credential?.avatarUrl || null,
              name: data.credential?.name || null,
              emailOrUserName: data.credential?.emailOrUserName || null,
              credentialId: data.credential?.id || null,
              createdDate: data.createdDate,
              idea: data.idea || "",
              appId: data.appId || "",
              imagesDataURL: data.imagesDataURL,
            };
            setPost(postFromDb);
            setEditorContent(postFromDb.content);
            const images = data.imagesDataURL as string[];
            setImageSrc(images && images.length > 0 ? images[0] : "");
          }
        }
      }
    }, 150);
  }, [credentialId]);

  useEffect(() => {
    if (credentialId !== null && typeof router.query.id === "string") {
      const idFromQuery = parseInt(router.query.id);
      if (!isNaN(idFromQuery) && idFromQuery !== 0) {
        debouncedApiCall(idFromQuery);
      }
    }
  }, [debouncedApiCall, credentialId, router.query.id]);

  const rewriteAction = async (instruction: ReWriteAI | string) => {
    if (!ischeckForAIAppsLoading && !isAIPresent) {
      showToast(
        "Please install ChatGPT app from Apps menu to use this feature",
        "error"
      );
      return;
    }
    setIsLoading(true);
    const response = await fetch(`/api/openai/completePost`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instruction,
        idea: editorContent,
      }),
    });
    setIsLoading(false);
    if (!response.ok) {
      const errorStatus = await response.json();
      showToast(errorStatus.message, "error");
      console.error(errorStatus);
      console.error("Failed to update data");
      return "";
    } else {
      const responseData = await response.json();
      if (instruction === ReWriteAI.ConverTwitter) {
        setEditorContent(responseData.post);
      }
      return responseData.post;
    }

    // setTitleModal(instruction);
    // setModalWriteAI(true);
  };

  const saveDraft = async (imageSrc?: string) => {
    const data = {
      id: post.id,
      title: title,
      content: editorContent,
      appId: appId,
      credentialId: credentialId,
      imagesDataURL: imageSrc ? [imageSrc] : undefined,
      pageId,
      fileInfo,
    };
    const response = await fetch(`/api/posts/saveDraft`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    if (response.ok) {
      const result = await response.json();
      router.push(`/write/${result.id}`);
      return result;
    } else {
      return null;
    }
  };

  const handleSaveDraft = async (imageSrc?: string) => {
    if (user?.id)
      TrackEventJuneSo({ id: user?.id.toString(), event: EVENTS.SAVE_DRAFT });
    setIsButtonSaveDraft(true);
    const result = await saveDraft(imageSrc);
    if (result !== null) {
      showToast("Saved successfully", "success");
      setIsButtonSaveDraft(false);
      return result;
    } else {
      showToast("Saved error", "error");
      setIsButtonSaveDraft(false);
      return false;
    }
  };

  const handleUpdateFromScheduleDialog = async (pluginData?: PluginType) => {
    const result = await saveDraft();
    if (result) {
      if (user?.id)
        TrackEventJuneSo({
          id: user?.id.toString(),
          event: EVENTS.SCHEDULE_POST,
        });
      const response = await fetch(`/api/posts/schedulePost`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: result.id, scheduleDay: selectedDateTime }),
      });
      setIsModalShowDay(false);
      if (response.ok) {
        showToast("Schedule successfully", "success");
        if (pluginData) {
          savePluginData(result.id, pluginData);
        }
      } else {
        const errorMessage = await response.json();
        showToast(`${errorMessage.message}`, "error");
      }
    }
  };

  const formatContent = async (format: string) => {
    return rewriteAction(format);
  };

  const handlePostNow = async (pluginData?: PluginType) => {
    try {
      setIsPublishLoading(true);
      setIsModalPostNow(false); // Close the dialog first

      const result = await saveDraft();
      if (!result) {
        showToast("Failed to save draft before publishing", "error");
        return;
      }

      if (user?.id) {
        TrackEventJuneSo({
          id: user?.id.toString(),
          event: EVENTS.PUBLIC_POST,
        });
      }

      let urlSocial = user?.currentSocialProfile?.appId?.replace(/-/g, "");
      if (urlSocial === "xsocial") {
        urlSocial = "twitterv1social";
      }

      const response = await fetch(
        `/api/integrations/${urlSocial}/post?id=${result.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        // Handle different error response formats from different social platforms
        const errorMessage = responseData?.message || responseData?.error || "Failed to publish post";
        showToast(`Publishing failed: ${errorMessage}`, "error");
      } else {
        // Check for success response format (some APIs return success: false even with 200 status)
        if (responseData?.success === false) {
          const errorMessage = responseData?.error || responseData?.message || "Failed to publish post";
          showToast(`Publishing failed: ${errorMessage}`, "error");
        } else {
          if (pluginData) {
            await savePluginData(result.id, pluginData);
          }
          showToast("Post has been published successfully!", "success");
          router.push("/my-content/posted");
        }
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      showToast("An unexpected error occurred while publishing", "error");
    } finally {
      setIsPublishLoading(false);
    }
  };

  const handleGetValueFromDialogFormatPost = (forMatPost: string) => {
    setEditorContent(forMatPost);
  };

  const handleRemoveImage = async () => {
    setImageSrc("");
    await handleSaveDraft("deleteImage");
  };

  async function savePluginData(id: string, pluginData: PluginType) {
    try {
      const response = await fetch(`/api/posts/savePlugin`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, plugin: pluginData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving plugin data:", errorData?.message || response.statusText);
        showToast("Failed to save plugin data", "error");
      }
    } catch (error) {
      console.error("Error saving plugin data:", error);
      showToast("Failed to save plugin data", "error");
    }
  }
  const currentUser = useCurrentUserAccount();
  const isUsePlugDialog = checkUserToUsePlug();
  const socialAccountsQuery =
    trpc.viewer.socials.getSocialNetWorking.useQuery();
  const [showNoAccountDialog, setShowNoAccountDialog] = useState(false);

  const handleCheckPublishPost = () => {
    // Don't allow publishing if already in progress
    if (isPublishLoading) {
      return;
    }

    // Check if there's a Twitter/X credential selected
    const currentSocialAccount = socialAccountsQuery.data?.find(
      (account) => account.isUserCurrentProfile
    );
    const hasTwitterCredential =
      currentSocialAccount?.appId?.toLowerCase() === "xconsumerkeys-social";

    if (isUsePlugDialog || hasTwitterCredential) {
      if (hasTwitterCredential && editorContent) {
        const charCount = stripHtml(editorContent).length;
        setTwitterCharacterCount(charCount);
        setShowTwitterDialog(true);
      } else {
        // No Twitter credential or no content, proceed with normal publish
        handlePostNow();
      }
    } else {
      handlePostNow();
    }
  };

  useEffect(() => {
    if (socialAccountsQuery.isFetched) {
      const data = socialAccountsQuery.data;
      if (Array.isArray(data) && data.length === 0) {
        setShowNoAccountDialog(true);
      }
    }
  }, [socialAccountsQuery.isFetched, socialAccountsQuery.data]);

  return (
    <>
      {isLoading && <LoadingDialog open={isLoading}></LoadingDialog>}

      {/* Publish Loading Dialog */}
      <Dialog open={isPublishLoading}>
        <DialogContent className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Publishing Post</h3>
              <p className="text-sm text-gray-600">
                Please wait while we publish your post to social media...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <HeadSeo title={t("Posts")} description={""} />
      <Shell withoutSeo heading={`Write Post`} subtitle="Here are your Posts">
        <div className="">
          <Dialog
            open={showNoAccountDialog}
            onOpenChange={setShowNoAccountDialog}
          >
            <DialogContent className="max-w-md w-full">
              <div className="py-6">
                <h3 className="mb-3 text-lg font-bold">
                  Link a social account
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  You must link at least one social account before writing
                  content.
                </p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setShowNoAccountDialog(false);
                      router.push("/settings/my-account/app-integrations");
                    }}
                  >
                    OK
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="mt-5 grid grid-cols-12 sm:mt-0">
            <div className="col-span-12 h-auto bg-white lg:col-span-7">
              <div className="w-full  shadow-sm">
                <div className="flex h-[43px] items-center gap-2 border-b border-r bg-white px-2 shadow-sm ">
                  <ReactTooltip content="Emoji" id="emoji" place="top" />
                  <div data-tooltip-id="rewriteAI">
                    <DropdownReWriteAI
                      content={editorContent}
                      rewriteAction={rewriteAction}
                      onCopyToWritePage={handleCopyToWritePage}
                      hasAI={!ischeckForAIAppsLoading && isAIPresent}
                    />
                  </div>
                  <ReactTooltip
                    content="Rewrite with AI"
                    id="rewriteAI"
                    place="top"
                  />
                  <button
                    data-tooltip-id="emoji"
                    onClick={() => setIsModalEmoji(true)}
                    className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
                  >
                    <Smile />
                  </button>

                  <button
                    data-tooltip-id="pickDraft"
                    onClick={() => setIsModalPickDraft(true)}
                    className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <ReactTooltip
                    content="Pick a Draft"
                    id="pickDraft"
                    place="top"
                  />
                  <button
                    data-tooltip-id="formatPost"
                    onClick={() => {
                      if (!ischeckForAIAppsLoading && !isAIPresent) {
                        showToast(
                          "Please install ChatGPT app from Apps menu to use this feature",
                          "error"
                        );
                        return;
                      }
                      setIsModalFormatPost(true);
                      if (user?.id)
                        TrackEventJuneSo({
                          id: user?.id.toString(),
                          event: EVENTS.FORMAT_POST,
                        });
                    }}
                    className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
                  >
                    <AlignStartVertical className="h-5 w-5" />
                  </button>
                  <ReactTooltip
                    content="Format Post"
                    id="formatPost"
                    place="top"
                  />
                  <button
                    data-tooltip-id="addImage"
                    onClick={() => setIsModalAddImage(true)}
                    className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <ReactTooltip content="Add Image" id="addImage" place="top" />
                  <button
                    data-tooltip-id="addVideo"
                    onClick={() => setIsModalAddVideo(true)}
                    className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
                  >
                    <Video className="h-5 w-5" />
                  </button>
                  <ReactTooltip content="Add Video" id="addVideo" place="top" />
                  <button
                    data-tooltip-id="convertTwitter"
                    onClick={() => rewriteAction(ReWriteAI.ConverTwitter)}
                    className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
                  >
                    <Twitter className="h-5 w-5" />
                  </button>
                  <ReactTooltip
                    content="Convert Twitter Post"
                    id="convertTwitter"
                    place="top"
                  />
                  <button
                    onClick={() => setIsModalUploadFile(true)}
                    className="hover:bg-awst flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm hover:text-white"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  {currentUser && (
                    <div
                      onClick={() => setShowModalAccounts(true)}
                      className="ml-auto flex cursor-pointer items-center justify-center hover:font-bold"
                    >
                      <SocialAvatar
                        size="sm"
                        appId={currentUser?.appId!}
                        avatarUrl={currentUser?.avatarUrl!}
                      />
                    </div>
                  )}
                </div>
                {appId === "medium-social" && (
                  <div className="-mt-1">
                    <div>
                      <label
                        htmlFor="title"
                        className="ml-3 mt-2 block text-sm font-medium leading-6 text-gray-900"
                      >
                        Title
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="ml-3 block w-11/12	 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Title"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="ml-3 mt-3 block text-sm font-medium leading-6 text-gray-900"
                      >
                        Content
                      </label>
                      <div className="mt-2">
                        <Editor
                          className="border-none	"
                          value={editorContent}
                          onTextChange={(e) =>
                            setEditorContent(e.htmlValue ?? "")
                          }
                          placeholder="Your content to rewrite and improve by AI ..."
                          style={{ height: "450px", border: "0" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {appId !== "medium-social" && (
                  <div>
                    <TextArea
                      className="editor m-2 "
                      placeholder="Your content to rewrite and improve by AI ..."
                      value={editorContent}
                      style={{
                        height: "450px",
                        backgroundColor: "white",
                        maxWidth: "95%",
                      }}
                      onChange={handleEditorChange}
                    ></TextArea>{" "}
                  </div>
                )}

                <div className="flex border-t p-4 text-[12px] shadow-sm sm:text-[13px]">
                  <span className="">Last saved at Dec 29, 2023, 3:58 PM</span>
                  <span className="ml-auto">
                    {editorContent ? stripHtml(editorContent).length : 0}{" "}
                    characters
                  </span>
                </div>
                <div className="flex border-b p-4 shadow-sm">
                  <Button
                    onClick={() => handleSaveDraft()}
                    disabled={isButtonSaveDraft}
                    className="text-dark rounded-2xl border bg-white text-[12px] hover:text-white sm:text-sm"
                  >
                    <p className="hidden sm:block">Save as Draft</p>
                    <p className="block sm:hidden">Save</p>
                  </Button>
                  <Button
                    disabled={post.id === 0}
                    onClick={() => setIsModalDeletePost(true)}
                    className="text-dark ml-2 rounded-2xl border bg-red-100 text-[12px] text-red-500 hover:border-red-400 hover:bg-red-200 sm:text-sm"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => {
                      setIsModalShowDay(true);
                    }}
                    className="text-dark ml-1 mr-1 rounded-2xl border bg-white text-[12px] hover:text-white sm:ml-auto sm:mr-2 sm:text-sm"
                  >
                    Schedule
                  </Button>
                  <Button
                    onClick={() => handleCheckPublishPost()}
                    disabled={isPublishLoading}
                    className="rounded-2xl text-[12px] hover:text-white sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPublishLoading ? "Publishing..." : "Publish"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-span-12 mt-[50px] h-[620px] bg-slate-100 lg:col-span-5 lg:mt-0">
              <div className="h-full overflow-y-auto pb-5">
                <div className="flex  h-[44px] items-center border-b-2 bg-white px-2 ">
                  <div className="font-bold">Post Preview</div>
                  <div className="ml-auto hidden sm:block">
                    <span className="flex">
                      <p>Devices:</p>
                      <button
                        className={`hover:text-awst ml-1 flex h-7 w-7 items-center justify-center rounded-full border ${
                          activeDevice === DeviceType.PHONE
                            ? "bg-blue-500 text-white hover:text-white"
                            : "text-awst bg-white"
                        }`}
                        onClick={() => handleDeviceChange(DeviceType.PHONE)}
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.709 0H17.29a1.326 1.326 0 0 1 1.324 1.323v21.354a1.326 1.326 0 0 1-1.323 1.324H6.708a1.327 1.327 0 0 1-1.324-1.324V1.323A1.326 1.326 0 0 1 6.71 0Zm4.112 21.883h2.359a.544.544 0 0 1 0 1.086H10.82a.545.545 0 0 1-.543-.543c0-.299.245-.543.543-.543Zm-4.234-1.032h10.826V3.15H6.587V20.85ZM16.89 1.308a.267.267 0 0 0 0 .533h.03a.267.267 0 0 0 0-.533h-.03Zm-9.812 0a.267.267 0 0 0 0 .533h.03a.267.267 0 0 0 0-.533h-.03Zm3.41 0h3.023v.533h-3.024v-.533Z"
                            clipRule="evenodd"
                          ></path>
                        </svg>{" "}
                      </button>
                      <button
                        className={`hover:text-awst mx-2 flex h-7 w-7 items-center justify-center rounded-full border ${
                          activeDevice === DeviceType.TAB
                            ? "bg-blue-500 text-white hover:text-white"
                            : "text-awst bg-white"
                        }`}
                        onClick={() => handleDeviceChange(DeviceType.TAB)}
                      >
                        <Tablet className="h-4 w-4" />
                      </button>
                      <button
                        className={`hover:text-awst flex h-7 w-7 items-center justify-center rounded-full border ${
                          activeDevice === DeviceType.PC
                            ? "bg-blue-500 text-white hover:text-white"
                            : "text-awst bg-white"
                        }`}
                        onClick={() => handleDeviceChange(DeviceType.PC)}
                      >
                        <Laptop className="h-4 w-4" />
                      </button>
                    </span>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-center px-4">
                  <PostPreview
                    name={user?.name!}
                    content={data.content}
                    likes={data.likes}
                    comments={data.comments}
                    reposts={data.reposts}
                    isExpanded={isExpanded}
                    toggleContent={toggleContent}
                    contentStyle={contentStyle}
                    editorContent={editorContent}
                    imageSrc={imageSrc}
                    fileInfo={fileInfo}
                    onDelete={handleRemoveImage}
                  />
                  <ScheduleDialog
                    open={isModalShowDay}
                    onClose={() => {
                      setIsModalShowDay(false);
                      setSelectedDateTime("");
                    }}
                    onDateTimeChange={handleDateTimeChangeFromSchedule}
                    onUpdate={handleUpdateFromScheduleDialog}
                  />
                  <PostNowDialog
                    open={isModalPostNow}
                    onClose={() => {
                      setIsModalPostNow(false);
                    }}
                    onUpdate={handlePostNow}
                  />
                  <AddImageDialog
                    open={isModalAddImage}
                    onClose={() => {
                      setIsModalAddImage(false);
                    }}
                    handleImageChange={async (imageSrc) => {
                      setIsModalAddImage(false);
                      setImageSrc(imageSrc);
                      await handleSaveDraft(imageSrc);
                    }}
                  />
                  <UploadFileDialog
                    open={isModalUploadFile}
                    onClose={() => {
                      setIsModalUploadFile(false);
                    }}
                  />
                  <UploadVideoDialog
                    open={isModalAddVideo}
                    onClose={async (fileInfo) => {
                      setFileInfo(fileInfo);
                      setIsModalAddVideo(false);
                      await saveDraft();
                    }}
                  />
                  <PickDraftDialog
                    open={isModalPickDraft}
                    onClose={() => {
                      setIsModalPickDraft(false);
                    }}
                    onEditAndPost={handleEditAndPostFromDialog}
                  />
                  <EmojiDialog
                    open={isModalEmoji}
                    onClose={() => setIsModalEmoji(false)}
                    onSelectEmoji={handleSelectEmojiFromDialog}
                  />
                  <FormatPostDialog
                    open={isModalFormatPost}
                    onOpen={() => setIsModalFormatPost(true)}
                    onClose={() => setIsModalFormatPost(false)}
                    onGetValue={handleGetValueFromDialogFormatPost}
                    formatContent={formatContent}
                    onCopy={handleCopyToWritePage}
                    onRetry={formatContent}
                  />
                  <DeletePostDialog
                    open={isModalDeletePost}
                    onClose={() => setIsModalDeletePost(false)}
                    id={post.id}
                    onDeleteComplete={(success) => {
                      if (success) {
                        showToast("Post has been deleted", "success");
                        setIsModalDeletePost(false);
                        router.push(`/write/0`).then(() => {
                          router.reload();
                        });
                      } else {
                        showToast("Failed to delete post", "error");
                      }
                    }}
                  />
                  <ModalAccount
                    showModal={showModalAccounts}
                    onClose={() => setShowModalAccounts(false)}
                  />
                  <ModalUpgrade
                    isOpen={isModalUpgradeOpen}
                    onClose={() => setIsModalUpgradeOpen(false)}
                  />
                  <TwitterCharacterLimitDialog
                    open={showTwitterDialog}
                    onClose={() => setShowTwitterDialog(false)}
                    content={editorContent}
                    characterCount={twitterCharacterCount}
                    onProceed={() => {
                      setShowTwitterDialog(false);
                      handlePostNow(); // Call handlePostNow directly instead of opening PostNowDialog
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </>
  );
};

WritePage.PageWrapper = PageWrapper;
export default WritePage;
