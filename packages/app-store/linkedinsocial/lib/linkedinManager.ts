import { dataURLToStream } from "../../_utils/dataURLToStream";
import { PageInfo } from "../../types";
import { getClient } from "./getClient";
import { PageInfoData } from "./type";
import prisma from "@quillsocial/prisma";
import axios from "axios";

/** ===== Version handling (REST header: LinkedIn-Version) ===== */
const _rawLinkedInVersion =
  process.env.LINKEDIN_API_VERSION ||
  process.env.LINKEDIN_VERSION ||
  "202509"; // latest (YYYYMM)

function normalizeLinkedInVersion(raw: string) {
  if (!raw) return "202509";
  if (/^\d{6}\.\d+$/.test(raw)) return raw;   // YYYYMM.RR
  if (/^\d{6}$/.test(raw)) return raw;        // YYYYMM
  if (/^\d{8}$/.test(raw)) return raw.substring(0, 6); // YYYYMMDD -> YYYYMM
  const m = raw.match(/(\d{6})/);
  return m ? m[1] : "202509";
}
const LINKEDIN_API_VERSION = normalizeLinkedInVersion(_rawLinkedInVersion);

/** ===== Utilities ===== */
function extractIdFromUrn(urnString: string): string | null {
  const match = urnString?.match(/:(\d+)$/);
  return match ? match[1] : null;
}

function toOrgUrn(idOrUrn: string): string {
  return idOrUrn.startsWith("urn:li:organization:")
    ? idOrUrn
    : `urn:li:organization:${idOrUrn}`;
}

// REST ids param must be URNs; v2 accepts numeric IDs. Build appropriately.
function buildIdsParam(ids: string[], isRest: boolean) {
  const list = isRest ? ids.map(toOrgUrn) : ids;
  return `ids=List(${list.join(",")})`;
}

// v2/shares payload transformer (last-ditch fallback)
function transformToV2ShareFormat(payload: any): any {
  const v2Payload: any = {
    owner: payload.author,
    text: { text: payload.commentary || "" },
    distribution: { linkedInDistributionTarget: {} },
  };
  if (payload.content?.media?.id) {
    v2Payload.content = {
      contentEntities: [{ entity: payload.content.media.id }],
      title: payload.content.media.title || "",
    };
  }
  return v2Payload;
}

/** ===== Generic REST → v2 fallback requester ===== */
async function linkedinApiRequest({
  urlRest,
  urlV2,
  method = "get",
  data,
  token,
  version = LINKEDIN_API_VERSION,
  extraHeaders = {},
}: {
  urlRest: string;
  urlV2?: string;
  method?: "get" | "post";
  data?: any;
  token: string;
  version?: string;
  extraHeaders?: Record<string, string>;
}) {
  const headersRest = {
    Authorization: `Bearer ${token}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": version,
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  const headersV2 = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  try {
    if (method === "get") {
      return await axios.get(urlRest, { headers: headersRest });
    } else {
      return await axios.post(urlRest, data, { headers: headersRest });
    }
  } catch (err: any) {
    const status = err?.response?.status;
    // Only fall back for classic “use old surface” signals
    if (status === 426 && urlV2) {
      if (method === "get") {
        return await axios.get(urlV2, { headers: headersV2 });
      } else {
        const v2Data =
          urlV2.includes("/shares") ? transformToV2ShareFormat(data) : data;
        return await axios.post(urlV2, v2Data, { headers: headersV2 });
      }
    }
    throw err;
  }
}

/** ===== Main post flow ===== */
export const post = async (postId: number) => {
  try {
    const linkedInPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!linkedInPost?.credentialId) return false;

    const accessToken = await getClient(linkedInPost.credentialId);
    if (!accessToken) {
      await prisma.post.update({ where: { id: postId }, data: { status: "ERROR" } });
      return false;
    }

    // Resolve author URN (page or person)
    let authorUrn = linkedInPost.pageId;
    if (!authorUrn) {
      const me = await getUserProfile(accessToken as string);
      authorUrn = `urn:li:person:${me.sub}`;
    }

    const images: string[] = Array.isArray(linkedInPost.imagesDataURL)
      ? (linkedInPost.imagesDataURL as string[])
      : [];
    const imgSrc = images[0] || "";

    const contentRaw = linkedInPost.content || "";
    // Basic escape for (){}[] and markdown-ish symbols to avoid unintended formatting
    const content = contentRaw.replace(/([\(\)\{\}\[\]@*<>\\_~])/g, "\\$1");

    const response = await createLinkedInPost(
      accessToken as string,
      content,
      imgSrc,
      authorUrn
    );

    if (!response) {
      await prisma.post.update({ where: { id: postId }, data: { status: "ERROR" } });
      return false;
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "POSTED",
        postedDate: new Date(),
        result: { shareId: response },
      },
    });
    return true;
  } catch (error) {
    await prisma.post.update({ where: { id: postId }, data: { status: "ERROR" } });
    console.error(error);
    return false;
  }
};

/** ===== Organizations (pages) ===== */
export async function getLinkedInPages(accessToken: string) {
  // Try REST first
  let url =
    "https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR";
  let headers: any = {
    Authorization: `Bearer ${accessToken}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": LINKEDIN_API_VERSION,
    "Content-Type": "application/json",
  };
  let pagesResponse;
  let isRest = true;

  try {
    pagesResponse = await axios.get(url, { headers });
  } catch (err: any) {
    if (err.response?.status === 426) {
      // Fallback to v2
      url =
        "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR";
      headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
      pagesResponse = await axios.get(url, { headers });
      isRest = false;
    } else {
      throw err;
    }
  }
  if (pagesResponse.status !== 200) return undefined;

  const pages: string[] =
    pagesResponse.data?.elements?.map((x: any) => extractIdFromUrn(x.organization)) || [];

  if (!pages.length) return [];

  const orgApiBase = isRest
    ? "https://api.linkedin.com/rest/organizations"
    : "https://api.linkedin.com/v2/organizations";

  const pageDetailUrl = `${orgApiBase}?${buildIdsParam(pages, isRest)}`;
  const pageDetailsResponse = await axios.get(pageDetailUrl, { headers });
  if (pageDetailsResponse.status !== 200) return undefined;

  const data = pageDetailsResponse.data as PageInfoData;
  const results = (isRest ? data.results : data) as any;

  const pageInfoes: PageInfo[] = Object.values(results).map((org: any) => ({
    id: `urn:li:organization:${org.id}`,
    name: org.vanityName || org.localizedName || `Organization ${org.id}`,
    isCurrent: false,
    info: org,
  }));

  return pageInfoes;
}

/** ===== Posting (REST posts) ===== */
async function createLinkedInPost(
  accessToken: string,
  postContent: string,
  imgSrc: string,
  author: string
): Promise<string | boolean> {
  let postData: any = {
    author,
    commentary: postContent,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
  };

  try {
    if (imgSrc) {
      const uploadData = await initializeUpload(accessToken, author);
      const uploadUrl = uploadData?.value?.uploadUrl;
      const imageUrn = uploadData?.value?.image as string;

      await uploadImage(accessToken, imgSrc, uploadUrl);

      postData = {
        ...postData,
        content: {
          media: {
            title: "",
            id: imageUrn,
          },
        },
        isReshareDisabledByAuthor: false,
      };
    }

    const response = await postLinkedInPost(accessToken, postData);
    return response;
  } catch (error: any) {
    console.error(
      "Error creating post:",
      error.response ? error.response.data : error.message
    );
    return false;
  }
}

const initializeUpload = async (accessToken: string, owner: string) => {
  const url = "https://api.linkedin.com/rest/images?action=initializeUpload";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": LINKEDIN_API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };
  const data = { initializeUploadRequest: { owner } };
  const response = await axios.post(url, data, { headers });
  return response.data;
};

const uploadImage = async (token: string, imgSrc: string, uploadUrl: string) => {
  // Most LinkedIn upload URLs are pre-signed; auth header is usually unnecessary, but harmless.
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "image/png" };
  const fileStream = dataURLToStream(imgSrc);
  const response = await axios.post(uploadUrl, fileStream, { headers });
  return response.status === 201;
};

async function postLinkedInPost(token: string, postData: any) {
  try {
    const response = await linkedinApiRequest({
      urlRest: "https://api.linkedin.com/rest/posts",
      urlV2: "https://api.linkedin.com/v2/shares",
      method: "post",
      data: postData,
      token,
      version: LINKEDIN_API_VERSION,
    });

    if (response.status === 201) {
      const shareId =
        response.headers["x-restli-id"] || response.headers["x-linkedin-id"];
      return shareId || true;
    }
    return false;
  } catch (error: any) {
    console.error(
      "Error posting to LinkedIn:",
      error.response ? error.response.data : error.message
    );
    return false;
  }
}

/** ===== Me (OAuth userinfo) ===== */
export async function getUserProfile(accessToken: string) {
  const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}
