import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TOKEN = process.env.NEXT_PUBLIC_TOKEN;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required");
}

if (!TOKEN) {
  throw new Error("NEXT_PUBLIC_TOKEN environment variable is required");
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log("📊 Response data:", response.data);
    console.log("📊 Response headers:", response.headers);
    console.log("📊 Full response:", response);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Response Error:",
      error.response?.status,
      error.message
    );
    console.error("📊 Error data:", error.response?.data);
    console.error("📊 Error response:", error.response);
    console.error("📊 Full error:", error);
    return Promise.reject(error);
  }
);
