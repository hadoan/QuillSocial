import { useRouter } from "next/router";
import { useEffect } from "react";

const InstagramCallback = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the URL contains a hash fragment with the access token
    if (typeof window !== "undefined" && window.location.hash) {
      // Extract the hash fragment (after '#')
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      // Extract the access token and other parameters from the hash
      const accessToken = params.get("access_token");
      const dataAccessExpirationTime = params.get(
        "data_access_expiration_time"
      );
      const expiresIn = params.get("expires_in");

      // If access token is present, redirect to the URL with query parameters
      if (accessToken) {
        // Construct the new URL with query parameters
        const redirectUrl = `/api/integrations/instagramsocial/callback?access_token=${accessToken}&data_access_expiration_time=${dataAccessExpirationTime}&expires_in=${expiresIn}`;

        // Use Next.js router to perform the redirect
        router.replace(redirectUrl);
      }
    }
  }, [router]);

  return (
    <div>
      <h1>Processing Instagram Callback...</h1>
      <p>Redirecting, please wait...</p>
    </div>
  );
};

export default InstagramCallback;
