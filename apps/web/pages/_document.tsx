import { GA_MEASUREMENT_ID } from "@lib/analytics/ga";
import { Html, Head, Main, NextScript } from "next/document";

const TAWK_TO_PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_TO_PROPERTY_ID;
const TAWK_TO_WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_TO_WIDGET_ID;

export default function Document() {
  return (
    <html lang="en-US" className="notranslate" translate="no">
      <Head>
        <meta charSet="utf-8" />
        <meta name="google" content="notranslate" />
        <meta name="robots" content="notranslate" />
        <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
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
        {TAWK_TO_PROPERTY_ID && TAWK_TO_WIDGET_ID ? (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/${TAWK_TO_PROPERTY_ID}/${TAWK_TO_WIDGET_ID}';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                })();
              `,
            }}
          />
        ) : null}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </html>
  );
}
