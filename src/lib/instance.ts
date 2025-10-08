import axios from "axios";

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
  },
});


instance.interceptors.request.use((config) => {
  console.log("[Axios Request]", config.method?.toUpperCase(), config.url);
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Axios Error]", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
