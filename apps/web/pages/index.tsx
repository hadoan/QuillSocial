import { getServerSession } from "@quillsocial/features/auth/lib/getServerSession";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import React from "react";

type Props = {
  origin: string;
};

export default function LandingPage({ origin }: Props) {
  const title = "Quill Social — AI-powered social media manager";
  const description =
    "Affordable, AI-powered social media management. Create ideas, polish posts, and schedule across all channels—fast. 100% open source, 100k AI tokens/month included.";
  const image = `${origin}/logo.png`;
  const url = `${origin}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Quill Social",
    url,
    description,
    publisher: {
      "@type": "Organization",
      name: "Quill Social",
      logo: { "@type": "ImageObject", url: image },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What's an AI token and how many posts is 100k?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An AI token is a unit used by our AI provider to measure compute. 100k tokens typically supports many hundreds to thousands of short social posts depending on length — we include 100k tokens/month with the plan.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I hit my monthly limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If you reach your monthly token limit, generation will be paused until the next billing cycle. You can also purchase top-ups to continue generating immediately.",
        },
      },
      {
        "@type": "Question",
        name: "How do top-ups work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Top-ups are simple one-time purchases that add more AI tokens to your account. Pricing and options are available on the pricing page.",
        },
      },
      {
        "@type": "Question",
        name: "Which channels are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support Facebook (pages & groups), Instagram (carousels), X (Twitter), LinkedIn (personal & company pages), YouTube community posts, TikTok descriptions, and more coming soon.",
        },
      },
      {
        "@type": "Question",
        name: "Can I cancel or get a refund?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Refunds and cancellations follow the policy in our Terms of Service. Lifetime purchases are one-time; please review the refund policy or contact support for issues.",
        },
      },
      {
        "@type": "Question",
        name: "Do I keep access after the trial if I bought Lifetime?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — Lifetime purchases grant continued access as described in the purchase terms.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data safe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your content and accounts are protected with enterprise-grade security. You can self-host and export content if desired.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:site_name" content="Quill Social" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={url} />
        <meta property="product:price:amount" content="19.00" />
        <meta property="product:price:currency" content="USD" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:site" content="@QuillSocial" />
        <meta
          name="keywords"
          content="social media, AI, scheduling, open source, content creation, social posts, marketing"
        />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "Quill Social Lifetime Access",
              description,
              image,
              offers: {
                "@type": "Offer",
                price: "19.00",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: `${url}/pricing`,
              },
            }),
          }}
        />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <header className="max-w-4xl w-full text-center mb-8">
          <img
            src="/logo.png"
            alt="Quill Social logo"
            className="mx-auto h-24 w-24"
          />
          <h1 className="text-4xl font-bold mt-4">Quill Social</h1>
          <p className="mt-2 text-lg text-slate-600">
            Create and schedule social posts in minutes—powered by AI
          </p>
          <p className="mt-4">
            All channels. Unlimited accounts.{" "}
            <strong>100k AI tokens/month</strong> included. Built in the open
            for complete transparency.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <a href="/auth/signup" className="btn-primary">
              Start 14-day Free Trial
            </a>
            <a href="/pricing" className="btn-ghost">
              Get Lifetime for $19
            </a>
          </div>
        </header>

        <section className="max-w-4xl w-full">
          <h2 className="text-2xl font-semibold">
            Everything you need for social media success
          </h2>
          <p className="mt-2 text-slate-700">
            From idea generation to scheduling, we've got every step of your
            social media workflow covered.
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <li>
              <h3 className="font-medium">Idea Generator</h3>
              <p className="text-sm text-slate-600">
                Never start from a blank page again.
              </p>
            </li>
            <li>
              <h3 className="font-medium">Post Formatter</h3>
              <p className="text-sm text-slate-600">
                Right tone, hashtags, and structure for each channel.
              </p>
            </li>
            <li>
              <h3 className="font-medium">Carousels & Visuals</h3>
              <p className="text-sm text-slate-600">
                Multi-slide posts in minutes.
              </p>
            </li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">How it works</h3>
          <ol className="list-decimal ml-6 mt-2 text-slate-700">
            <li>Describe your post — write a prompt or paste a link.</li>
            <li>
              Generate & tweak — pick short caption, carousel, or long form.
            </li>
            <li>Schedule everywhere — select channels and time, done.</li>
          </ol>

          <h3 className="mt-8 text-xl font-semibold">Supported channels</h3>
          <p className="text-slate-700 mt-2">
            Facebook, Instagram, X (Twitter), LinkedIn, YouTube community posts,
            TikTok descriptions and more.
          </p>
        </section>

        <footer className="mt-12 text-sm text-slate-500">
          <p>© 2025 QuillAI — All rights reserved</p>
        </footer>
      </main>
    </>
  );
}

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerSession({ req, res });

  // If user is logged in, redirect to the app write page
  if (session?.user?.id) {
    return { redirect: { permanent: false, destination: "/write/0" } };
  }

  // Build origin from request for absolute URLs in meta tags
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host;
  const origin = host ? `${proto}://${host}` : "https://quillsocial.com";

  return { props: { origin } };
}
