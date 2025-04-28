// import getAppKeysFromSlug from "_utils/getAppKeysFromSlug";
import axios from "axios";
import { google } from "googleapis";
import { z } from "zod";
import { GoogleAuth } from 'google-auth-library';

import { prisma } from "@quillsocial/prisma";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

const GMB_BASE_URL = "https://mybusiness.googleapis.com/v4";

const credentialsSchema = z.object({
    refresh_token: z.string().optional(),
    expiry_date: z.number().optional(),
    access_token: z.string().optional(),
    token_type: z.string().optional(),
    scope: z.string().optional(),
});

export async function listGMBLocations(userId: number) {
    try {
        const { client_id, client_secret } = await getAppKeysFromSlug("google-calendar");
        if (!client_id || typeof client_id !== "string") throw new Error("Google client_id missing.");
        if (!client_secret || typeof client_secret !== "string") throw new Error("Google client_secret missing.");

        const hasExistingCredentials = await prisma.credential.findFirst({
            where: {
                type: "googlemybusiness_social",
                userId,
            },
        });
        if (!hasExistingCredentials) {
            throw new Error("No Google My Business credentials found");
        }

        const credentials = credentialsSchema.parse(hasExistingCredentials.key);

        const redirect_uri = WEBAPP_URL + "/api/integrations/googlemybusinesssocial/callback";

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

        oAuth2Client.setCredentials(credentials);
        // await listGmbAccounts(credentials.access_token!);

        const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
            version: 'v1',
            auth: oAuth2Client,
        });

        //wait for approval
        const res = await mybusinessaccountmanagement.locations.admins.list({
            parent: 'accounts/6221676578910801496',
        });
        console.log('My Business Accounts:', res.data);

        const mybusinessplaceactions = google.mybusinessplaceactions({
            version: 'v1',
            auth: oAuth2Client,
        });
        const links = await mybusinessplaceactions.locations.placeActionLinks.list({
            parent: 'accounts/6221676578910801496'
        });
        console.log(links.data);
        // google.mybusinessaccountmanagement()
        
        // const logding = google.mybusinesslodging({
        //     version: 'v1',
        //     auth: oAuth2Client,
        // });
        // mybusinessaccountmanagement.locations.admins.
        // const response = await mybusinessaccountmanagement.accounts.lo .create({
        //     parent: 'accounts/{accountId}/locations/{locationId}',
        //     requestBody: {

        //       languageCode: 'en-US',
        //       summary: 'Exciting News!',
        //       callToAction: {
        //         actionType: 'LEARN_MORE',
        //         url: 'https://www.example.com',
        //       },
        //       // Other post types and details as necessary
        //     },

        //   });
    } catch (error) {
        console.error("Error listing GMB locations:", error);
    }
}

async function listGmbAccounts(accessToken: string) {
    try {
        const response = await axios.post(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log("GMB Accounts:", response.data);
    } catch (error) {
        console.error("Error fetching GMB accounts:", error);
    }
}

const USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

export async function fetchUserInfo(accessToken: string) {
    try {
        const response = await axios.get(USERINFO_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log('User Email:', response.data.email);
        return response.data;
    } catch (error) {
        console.error('Error fetching user email:', error);
        return undefined;
    }
}
