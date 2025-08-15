import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";

// Simple auth error page. Displays an error message passed via query string and links back to login.
// NextAuth redirects here when configured in AUTH_OPTIONS.pages.error.

type Props = { message: string };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const raw = (ctx.query.error as string) || "Unknown error";
  // Decode plus/encoded spaces and URI components
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw.replace(/\+/g, "%20"));
  } catch (_) {
    // keep raw if decode fails
  }
  return { props: { message: decoded } };
};

export default function AuthErrorPage({ message }: Props) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Authentication Error</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Authentication Error</h1>
        <p className="mb-6 break-words rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Go Back
          </button>
          <Link
            href="/auth/login"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </>
  );
}
