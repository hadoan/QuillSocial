import { dataURLToStream } from "../../_utils/dataURLToStream";
import { PageInfo } from "../../types";
import { getClient } from "./getClient";
import { PageInfoData } from "./type";
import prisma from "@quillsocial/prisma";
import axios from "axios";

const versionNumber = "202402";

// Utility for LinkedIn REST/v2 fallback
function transformToV2ShareFormat(payload: any): any {
  // Transform REST API payload to v2/shares format based on official LinkedIn documentation
  // Reference: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/share-api

  const v2Payload: any = {
    owner: payload.author, // Map author to owner
    text: {
      text: payload.commentary || "",
    },
  };

  // Add distribution based on v2/shares format
  if (payload.distribution) {
    v2Payload.distribution = {
      linkedInDistributionTarget: {},
    };

    // Map feedDistribution if present
    if (payload.distribution.feedDistribution) {
      v2Payload.distribution.linkedInDistributionTarget.visibleToGuest =
        payload.distribution.feedDistribution === "MAIN_FEED";
    }
  } else {
    // Default distribution for v2/shares
    v2Payload.distribution = {
      linkedInDistributionTarget: {},
    };
  }

  // Add content based on v2/shares format for images
  if (payload.content && payload.content.media) {
    v2Payload.content = {
      contentEntities: [
        {
          entity: payload.content.media.id, // Use the image URN directly
          entityLocation: "", // Empty for images
        },
      ],
      title: payload.content.media.title || "",
    };
  }

  // Remove fields not supported by v2/shares API
  // v2/shares only supports: owner, text, distribution, content
  // Does NOT support: lifecycleState, visibility, commentary, author, isReshareDisabledByAuthor

  return v2Payload;
}

async function linkedinApiRequest({
  urlRest,
  urlV2,
  method = "get",
  data,
  token,
  version = versionNumber,
  extraHeaders = {},
}) {
  let headersRest = {
    Authorization: `Bearer ${token}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": version,
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  let headersV2 = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  try {
    console.log("Trying REST API first:", urlRest);
    if (method === "get") {
      return await axios.get(urlRest, { headers: headersRest });
    } else {
      return await axios.post(urlRest, data, { headers: headersRest });
    }
  } catch (err) {
    const error = err as any;
    console.log("REST API failed with status:", error.response?.status);

    // For production, only fallback on 426 Upgrade Required
    if (error.response && error.response.status === 426 && urlV2) {
      console.log("Fallback to v2 API:", urlV2);

      if (method === "get") {
        return await axios.get(urlV2, { headers: headersV2 });
      } else {
        // Transform data for v2/shares if needed
        let v2Data = data;
        if (urlV2.includes("/shares")) {
          console.log("Original data:", JSON.stringify(data, null, 2));
          v2Data = transformToV2ShareFormat(data);
          console.log("Transformed v2 data:", JSON.stringify(v2Data, null, 2));
        }
        return await axios.post(urlV2, v2Data, { headers: headersV2 });
      }
    }
    throw err;
  }
}

export const post = async (postId: number) => {
  try {
    const linkedInPost = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!linkedInPost || !linkedInPost.credentialId) return false;
    const accessToken = await getClient(linkedInPost.credentialId);
    let pageId = linkedInPost.pageId;
    if (!pageId) {
      pageId = `urn:li:person:${
        (await getUserProfile(accessToken as string)).sub
      }`;
    }
    if (!accessToken) {
      await prisma.post.update({
        where: { id: linkedInPost.id },
        data: { status: "ERROR" },
      });
      return false;
    }

    const images = linkedInPost.imagesDataURL as string[];
    const imgSrc = images && images.length > 0 ? images[0] : "";

    const content = linkedInPost.content.replace(
      /([\(\)\{\}\[\]])|([@*<>\\\_~])/g,
      (match: string, p1: string, p2: string) => {
        return "\\" + (p1 || p2);
      }
    );

    const response = await createLinkedInPost(
      accessToken,
      content,
      imgSrc,
      linkedInPost.pageId
    );
    if (!response) {
      await prisma.post.update({
        where: { id: linkedInPost.id },
        data: { status: "ERROR" },
      });
      return false;
    } else {
      await prisma.post.update({
        where: { id: linkedInPost.id },
        data: {
          status: "POSTED",
          postedDate: new Date(),
          result: {
            shareId: response,
          },
        },
      });
      return true;
    }
  } catch (error) {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "ERROR" },
    });
    console.error(error);
    return false;
  }
};

export async function getLinkedInPages(accessToken: string) {
  // Try new REST API endpoint first
  let url =
    "https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED";
  let headers: any = {
    Authorization: `Bearer ${accessToken}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": versionNumber,
    "Content-Type": "application/json",
  };
  let pagesResponse;
  try {
    pagesResponse = await axios.get(url, { headers });
  } catch (err: any) {
    if (err.response && err.response.status === 426) {
      // Fallback to v2 endpoint if 426 Upgrade Required
      url =
        "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED";
      headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };
      pagesResponse = await axios.get(url, { headers });
    } else {
      throw err;
    }
  }
  if (pagesResponse.status !== 200) return undefined;

  const pages = pagesResponse.data?.elements.map((x: any) =>
    extractIdFromUrn(x.organization)
  );
  if (pages) {
    // Use the same API version as the organizationAcls call
    const orgApiBase = url.includes("/v2/")
      ? "https://api.linkedin.com/v2/organizations"
      : "https://api.linkedin.com/rest/organizations";
    const pageDetailUrl = `${orgApiBase}?ids=List(${pages.join(",")})`;
    const pageDetailsResponse = await axios.get(pageDetailUrl, {
      headers,
    });
    if (pageDetailsResponse.status === 200) {
      const data = pageDetailsResponse.data as PageInfoData;
      const pageInfoes: PageInfo[] = Object.values(data.results).map(
        (org: any) => ({
          id: `urn:li:organization:${org.id}`,
          name: org.vanityName,
          isCurrent: false,
          info: org,
        })
      );
      return pageInfoes;
    }
  }
  return undefined;
}
function extractIdFromUrn(urnString: string): string | null {
  const match = urnString.match(/:(\d+)$/);
  return match ? match[1] : null;
}

async function createLinkedInPost(
  accessToken: any,
  postContent: any,
  imgSrc: string,
  author: any
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
      await uploadImage(accessToken, imgSrc, uploadUrl);
      const imageUrn = uploadData?.value?.image!;
      postData = {
        author,
        commentary: postContent,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        content: {
          media: {
            title: "",
            id: imageUrn,
          },
        },
        lifecycleState: "PUBLISHED",
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
  const versionNumber = "202311";

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": versionNumber,
    "X-RestLi-Protocol-Version": "2.0.0",
  };

  const data = {
    initializeUploadRequest: {
      owner,
    },
  };
  const response = await axios.post(url, data, { headers });
  return response.data;
};

const uploadImage = async (
  token: string,
  imgSrc: string,
  uploadUrl: string
) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "image/png", // Adjust the content type based on your image type
  };

  const fileStream = dataURLToStream(imgSrc);
  const response = await axios.post(uploadUrl, fileStream, { headers });
  // console.log(response.data);
  // response.status === 201
  return response.status === 201 ? true : false;
};

async function postLinkedInPost(token: string, postData: any) {
  try {
    const response = await linkedinApiRequest({
      urlRest: "https://api.linkedin.com/rest/posts",
      urlV2: "https://api.linkedin.com/v2/shares",
      method: "post",
      data: postData,
      token,
      version: versionNumber,
    });

    if (response.status === 201) {
      // LinkedIn can return either x-restli-id or x-linkedin-id depending on the API version
      const shareId =
        response.headers["x-restli-id"] || response.headers["x-linkedin-id"];
      console.log("LinkedIn post successful, share ID:", shareId);
      return shareId || true; // Return the share ID if available, otherwise just true for success
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

async function getImageType(url: string): Promise<string | null> {
  try {
    // Send a HEAD request to get only the headers
    const response = await axios.head(url);

    // Check the "Content-Type" header
    const contentType = response.headers["content-type"];

    // Determine the image type based on the "Content-Type" header
    if (contentType && contentType.startsWith("image/")) {
      return contentType.replace("image/", "");
    } else {
      console.error("The URL does not point to an image.");
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching image headers:", error.message);
    return null;
  }
}

// export const getOtherPersonPosts(){

//   // curl -X GET "https://api.linkedin.com/rest/peopleTypeahead?q=memberConnections&keywords=ann" \
//   // -H "Authorization: Bearer AQVUhItTtKOj598yehd1_iRyA1pZAFgfQpBu-b8Hq_tONV0PNaqixk-sQwgVfCkVU1A5zJv4S3xS2TTf4o6khvWhGynWCXkODzGz6t0foo9uN8i45J0D87ImSc1Z5C_f_Md8BK9wT_F-X-44TzMfXhMdPAt-FuNOrzS3A55PDP-sSQEaxoVSfwAU2aorEIiCrFpSYQ5jwYs986bHMEyIN8b7gdlL3CrS1GGKdgbtbWeFO4hj4YPxBEErTvHdpA0sKUWE6JZLDv-OajDWDNkIngv3vUg77uXSLwzVmxIMNRgCTuHGjOKBlPPT_m9frAbtKuHvLUdKY2gwBBOYnKcrW_mWF-nXlQ" \
//   // -H "X-Restli-Protocol-Version: 2.0.0" \
//   // -H "LinkedIn-Version: 202402" \
//   // -H "Content-Type: application/json"

// }

export async function getUserProfile(accessToken: string) {
  const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
