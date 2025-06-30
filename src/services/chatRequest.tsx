import AsyncStorage from "@react-native-async-storage/async-storage";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ContentType =
  | "application/json"
  | "multipart/form-data"
  | "text/plain"
  | "application/x-www-form-urlencoded";

export const APPSYNC_URL =
  "https://vik664peovg2vo23qpqmu5linm.appsync-api.ap-south-1.amazonaws.com/graphql";
export const APPSYNC_API_KEY = "da2-yfvfhju5ybgchh3ahf3mkcqwfu";
export const CHAT_BASE_URL = "https://chatapi.circlespace.in/api/";
export interface ChatReqResponse {
  message: string;
  data: Data;
  error: boolean;
  status_code: number;
}

export interface Data {
  results: any;
  status: number;
}

// Generic type for API response
async function chatRequest<T>(
  endpoint: string,
  method: RequestMethod = "GET",
  body: any = null,
  contentType: ContentType = "application/json",
  
): Promise<T> {
  const headers: HeadersInit_ = {};
  const token = await AsyncStorage.getItem("userToken");
  // Set headers based on the content type
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  // Set Authorization header if token is provided
  if (token) {
    headers["Authorization"] = `${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  // If body exists and method is not GET, append the body
  if (body && method !== "GET") {
    if (contentType === "application/json") {
      options.body = JSON.stringify(body); // Convert to JSON if needed
    } else if (contentType === "multipart/form-data") {
      options.body = body; // For form-data, body is already in the correct format
      delete headers["Content-Type"]; // Let the browser set it automatically
    } else {
      options.body = body; // For text/plain or other content types
    }
  }
  console.log('token',token)

  try {
    const response = await fetch(CHAT_BASE_URL + endpoint, options);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      // console.log(response?.status,body)
      // throw new Error(`Request failed with status: ${response.status}`);
    }

    const responseContentType = response.headers.get("Content-Type");

    // Parse the response based on the content type
    if (
      responseContentType &&
      responseContentType.includes("application/json")
    ) {
      return (await response.json()) as T; // Parse JSON response
    } else if (responseContentType && responseContentType.includes("text")) {
      return (await response.text()) as unknown as T; // Parse text response
    } else {
      return response as any; // Return raw response if content type is unknown
    }
  } catch (error) {
    console.error("Error during fetch:", error);
    throw error;
  }
}
export default chatRequest;
