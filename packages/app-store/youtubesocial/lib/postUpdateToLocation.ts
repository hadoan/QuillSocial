import axios from "axios";

// Define the type for your post request body
interface LocalPostRequestBody {
  languageCode: string;
  summary: string;
  callToAction: {
    actionType: string;
    url: string;
  };
  topicType: string;
}

// Function to post an update to a GMB location
async function postUpdateToLocation(
  accessToken: string,
  accountId: string,
  locationId: string,
  postData: LocalPostRequestBody
) {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;

  try {
    const response = await axios.post(url, postData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Post creation successful:", response.data);
  } catch (error: any) {
    console.error(
      "Error creating post:",
      error.response ? error.response.data : error.message
    );
  }
}

// Example usage
const accessToken = "YOUR_ACCESS_TOKEN"; // Replace with your actual access token
const accountId = "YOUR_ACCOUNT_ID"; // Replace with your actual account ID
const locationId = "YOUR_LOCATION_ID"; // Replace with your actual location ID

const postData: LocalPostRequestBody = {
  languageCode: "en-US",
  summary:
    "Exciting News! We are launching a new product this weekend. Stay tuned!",
  callToAction: {
    actionType: "LEARN_MORE",
    url: "https://www.example.com/new-product",
  },
  topicType: "STANDARD",
};

postUpdateToLocation(accessToken, accountId, locationId, postData);
