import axios from "axios";

import prisma from "@quillsocial/prisma";

import { dataURLToStream } from "../../_utils/dataURLToStream";
import { PageInfo } from "../../types";
import { getClient } from "./getClient";
import { PageInfoData } from "./type";

const versionNumber = "202402";

export const post = async (postId: number) => {
  try {
    const linkedInPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!linkedInPost || !linkedInPost.credentialId) return false;
    const accessToken = await getClient(linkedInPost.credentialId);
    let pageId = linkedInPost.pageId;
    if (!pageId) {
      pageId = `urn:li:person:${(await getUserProfile(accessToken as string)).sub}`;
    }
    if (!accessToken) {
      await prisma.post.update({ where: { id: linkedInPost.id }, data: { status: "ERROR" } });
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

    const response = await createLinkedInPost(accessToken, content, imgSrc, linkedInPost.pageId);
    if (!response) {
      await prisma.post.update({ where: { id: linkedInPost.id }, data: { status: "ERROR" } });
      return false;
    } else {
      await prisma.post.update({
        where: { id: linkedInPost.id },
        data: {
          status: "POSTED", postedDate: new Date(), result: {
            shareId: response,
          }
        },
      });
      return true;
    }
  } catch (error) {
    await prisma.post.update({ where: { id: postId }, data: { status: "ERROR" } });
    console.error(error);
    return false;
  }
};

export async function getLinkedInPages(accessToken: string) {
  // GET https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(*,roleAssignee~(localizedFirstName, localizedLastName), organization~(localizedName)))
  const url =
    " https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED";

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": versionNumber,
    "Content-Type": "application/json",
  };
  const pagesResponse = await axios.get(url, {
    headers,
  });
  if (pagesResponse.status !== 200) return undefined;

  const pages = pagesResponse.data?.elements.map((x: any) => extractIdFromUrn(x.organization));
  if (pages) {
    const pageDetailUrl = `https://api.linkedin.com/rest/organizations?ids=List(${pages.join(",")})`;
    const pageDetailsResponse = await axios.get(pageDetailUrl, {
      headers,
    });
    if (pageDetailsResponse.status === 200) {
      const data = pageDetailsResponse.data as PageInfoData;
      const pageInfoes: PageInfo[] = Object.values(data.results).map((org: any) => ({
        id: `urn:li:organization:${org.id}`,
        name: org.vanityName,
        isCurrent: false,
        info: org,
      }));
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
    console.error("Error creating post:", error.response ? error.response.data : error.message);
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

const uploadImage = async (token: string, imgSrc: string, uploadUrl: string) => {
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
  const url = "https://api.linkedin.com/rest/posts";
  const headers = {
    Authorization: `Bearer ${token}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": versionNumber,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, postData, { headers });
    // console.log(response.headers["x-restli-i "]);//'urn:li:share:7158498305902100482'
    console.log(response.headers);
    return response.status === 201 ? response.headers["x-restli-id"] : false;
  } catch (error) {
    console.error(error);
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
