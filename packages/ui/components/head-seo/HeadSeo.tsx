import type {
  AppImageProps,
  MeetingImageProps,
} from "@quillsocial/lib/OgImages";
import {
  constructAppImage,
  constructGenericImage,
  constructMeetingImage,
} from "@quillsocial/lib/OgImages";
import { getBrowserInfo } from "@quillsocial/lib/browser/browser.utils";
import { APP_NAME, WEBAPP_URL } from "@quillsocial/lib/constants";
import {
  seoConfig,
  getSeoImage,
  buildCanonical,
} from "@quillsocial/lib/next-seo.config";
import { truncateOnWord } from "@quillsocial/lib/text";
import { merge } from "lodash";
import type { NextSeoProps } from "next-seo";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

export type HeadSeoProps = {
  title: string;
  description: string;
  siteName?: string;
  url?: string;
  canonical?: string;
  nextSeoProps?: NextSeoProps;
  app?: AppImageProps;
  meeting?: MeetingImageProps;
  isBrandingHidden?: boolean;
};

/**
 * Build full seo tags from title, desc, canonical and url
 */
const buildSeoMeta = (pageProps: {
  title: string;
  description: string;
  image: string;
  siteName?: string;
  url?: string;
  canonical?: string;
}): NextSeoProps => {
  const {
    title,
    description,
    image,
    canonical,
    siteName = seoConfig.headSeo.siteName,
  } = pageProps;
  return {
    title: title,
    canonical: canonical,
    openGraph: {
      site_name: siteName,
      type: "website",
      title: title,
      description: description,
      images: [
        {
          url: image,
        },
      ],
    },
    additionalMetaTags: [
      {
        property: "name",
        content: title,
      },
      {
        property: "description",
        content: description,
      },
      {
        name: "description",
        content: description,
      },
      {
        property: "image",
        content: image,
      },
    ],
  };
};

export const HeadSeo = (props: HeadSeoProps): JSX.Element => {
  // The below code sets the defaultUrl for our canonical tags

  // Get the current URL from the window object
  const { url } = getBrowserInfo();
  // Check if the URL is from quillsocial.co
  const isCalcom =
    url &&
    (new URL(url).hostname.endsWith("quillsocial.co") ||
      new URL(url).hostname.endsWith("app.quillsocial.co"));
  // Get the router's path
  const path = useRouter().asPath;
  const selfHostedOrigin = WEBAPP_URL || "https://quillsocial.co";
  // Set the default URL to either the current URL (if self-hosted) or https://quillsocial.co canonical URL
  const defaultUrl = isCalcom
    ? buildCanonical({ path, origin: "https://quillsocial.co" })
    : buildCanonical({ path, origin: selfHostedOrigin });

  const {
    title,
    description,
    siteName,
    canonical = defaultUrl,
    nextSeoProps = {},
    app,
    meeting,
    isBrandingHidden,
  } = props;

  const image =
    getSeoImage("ogImage") + constructGenericImage({ title, description });
  const truncatedDescription = truncateOnWord(description, 158);
  const pageTitle = `${title}${isBrandingHidden ? "" : ` | ${APP_NAME}`}`;
  let seoObject = buildSeoMeta({
    title: pageTitle,
    image,
    description: truncatedDescription,
    canonical,
    siteName,
  });

  if (meeting) {
    const pageImage = getSeoImage("ogImage") + constructMeetingImage(meeting);
    seoObject = buildSeoMeta({
      title: pageTitle,
      description: truncatedDescription,
      image: pageImage,
      canonical,
      siteName,
    });
  }

  if (app) {
    const pageImage =
      getSeoImage("ogImage") +
      constructAppImage({ ...app, description: truncatedDescription });
    seoObject = buildSeoMeta({
      title: pageTitle,
      description: truncatedDescription,
      image: pageImage,
      canonical,
      siteName,
    });
  }

  const seoProps: NextSeoProps = merge(nextSeoProps, seoObject);

  return <NextSeo {...seoProps} />;
};

export default HeadSeo;
