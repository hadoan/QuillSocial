import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { LINKEDIN_CLIENT_ID, LINKEDIN_SCOPES, WEBAPP_URL } from '@quillsocial/lib/constants';

const app_id = LINKEDIN_CLIENT_ID;
const redirectUri = WEBAPP_URL + "/api/integrations/linkedinsocial/callback";
const authEndpoint = "https://www.linkedin.com/oauth/v2/authorization";
const scopes = encodeURIComponent(LINKEDIN_SCOPES);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {

    const response = await axios.get(
      `${authEndpoint}?client_id=${app_id}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`
    );
    res.status(200).json({ url: response.request.res.responseUrl });
  }
}