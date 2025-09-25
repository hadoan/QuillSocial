import { Html, Head, Main, NextScript } from "next/document";
import { GA_MEASUREMENT_ID } from "@lib/analytics/ga";

export default function Document() {
  return (
    <html lang="en-US" className="notranslate" translate="no">
      <Head>
        <meta charSet="utf-8" />
        <meta name="google" content="notranslate" />
        <meta name="robots" content="notranslate" />
        <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {GA_MEASUREMENT_ID ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_MEASUREMENT_ID}');`,
              }}
            />
          </>
        ) : null}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </html>
  );
}
