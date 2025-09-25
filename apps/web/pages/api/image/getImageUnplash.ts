import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import { defaultResponder } from "@quillsocial/lib/server";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function handler(
  req: NextApiRequest & { query: { key?: string } },
  res: NextApiResponse
) {
  const { query } = req;
  const { key } = query;

  if (!key) {
    res.status(404).json({ message: "No query provided" });
    return;
  }

  const session = await getServerSession({ req, res });

  if (!session?.user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const images = await searchUnsplashImages(key);

  if (images && images.length > 0) {
    const imageDetails = images.map((image: any) => {
      return {
        imageUrl: image.urls.regular,
        authorName: image.user.name,
        authorLink: image.user.username,
      };
    });
    res.status(200).json({ imageDetails });
  } else {
    res.status(404).json({ message: "No images found" });
  }
}

async function searchUnsplashImages(
  query: string,
  page: number = 1,
  perPage: number = 8
) {
  try {
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: query,
        page: page,
        per_page: perPage,
        client_id: UNSPLASH_ACCESS_KEY,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error occurred while fetching images from Unsplash:", error);
    return null;
  }
}

export default defaultResponder(handler);
