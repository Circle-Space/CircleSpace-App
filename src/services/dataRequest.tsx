/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
import AsyncStorage from "@react-native-async-storage/async-storage";
// const BASE_URL = "https://cs-app-backend.onrender.com";
// const BASE_URL = "https://cs-app-backend-2xix.onrender.com";
// const BASE_URL = 'http://appapi.circlespace.in:5000';
// const BASE_URL = 'https://appapi.circlespace.in';
// export const BASE_URL = "https://prodapi.circlespace.in";
// export const BASE_URL = "https://prodapi.circlespace.in";
export const BASE_URL = "https://stagingapi.circlespace.in";
// export const BASE_URL = "https://stagingapi.circlespace.in";
// export const BASE_URL = "http://10.0.0.170:5000";
// const BASE_URL = "http://10.0.0.134:5000";
// export const BASE_URL = "http://10.0.0.170:5000"
// export const BASE_URL = "http://192.168.1.60:5000";
export const get = async (
  endpoint: any,
  queryParams: any = {},
  token: string
) => {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  // console.log("url :: 22 ::", url);
  
  // Append query parameters to the URL
  // console.log("queryParams :: 19 ::", url);
  Object.keys(queryParams).forEach((key) =>
    url.searchParams.append(key, queryParams[key])
  );

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token in the headers
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getWithoutToken = async (endpoint: any, queryParams: any = {}) => {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  const token = await AsyncStorage.getItem("userToken");

  // Append query parameters to the URL
  Object.keys(queryParams).forEach((key) =>
    url.searchParams.append(key, queryParams[key])
  );

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Function to handle POST requests
export const post = async (endpoint: any, payload: any) => {
  const url = `${BASE_URL}/${endpoint}`;
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Add any additional headers if required
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export const createUser = async (endpoint: any, payload: any) => {
  const url = `${BASE_URL}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export const postWithNoAuth = async (endpoint: any, payload: any) => {
  const url = `${BASE_URL}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any additional headers if required
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

// Function to handle PUT requests
export const put = async (endpoint: any, payload: any) => {
  const url = `${BASE_URL}/${endpoint}`;
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Add any additional headers if required
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error putting data:", error);
    throw error;
  }
};

// Function to handle DELETE requests
export const del = async (endpoint: any, id?: string) => {
  // const url = `${BASE_URL}/${endpoint}/${id}`;
  const url = id ? `${BASE_URL}/${endpoint}/${id}` : `${BASE_URL}/${endpoint}`;
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Add any additional headers if required
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};

// Function to handle DELETE requests with request body
export const delPost = async (endpoint: any, payload: any) => {
  const url = `${BASE_URL}/${endpoint}`;
  try {
    console.log("url 123 ::",url);
    console.log("payload 123 ::",payload);
    const token = await AsyncStorage.getItem("userToken");
    console.log("token 123 ::",token);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};
