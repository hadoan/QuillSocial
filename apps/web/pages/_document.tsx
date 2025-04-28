import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <html lang="en-US" className="notranslate" translate="no">
      <Head>
        <meta charSet="utf-8" />
        <meta name="google" content="notranslate" />
        <meta name="robots" content="notranslate" />
        <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </html>
  );
}
