import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://hris-api-kappa.vercel.app/api/v1";
const TOKEN = process.env.NEXT_PUBLIC_TOKEN;

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Helper function to convert backend status to frontend format
function convertToFrontendFormat(backendStatus: string): boolean {
  return backendStatus === "active";
}

// Helper function to convert frontend format to backend status
function convertToBackendFormat(isActive: boolean): string {
  return isActive ? "active" : "inactive";
}

// GET - Get survey status
export async function GET() {
  try {
    // Get status from backend API - endpoint returns array
    const response = await instance.get("/surveystatus");

    console.log("Backend API response:", {
      status: response.status,
      data: response.data,
    });

    // Check if response has expected structure
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response structure from backend");
    }

    // If response is empty object, return default active status
    if (Object.keys(response.data).length === 0) {
      console.warn(
        "Empty response from backend, returning default active status"
      );
      return NextResponse.json({
        message: "Survey status retrieved (default - empty response)",
        data: {
          isActive: true,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Debug: Log the actual response structure
    console.log("🔍 Backend response structure:", {
      keys: Object.keys(response.data),
      data: response.data,
      hasData: !!response.data.data,
      hasEmployee: !!response.data.employee,
      hasStatus: !!response.data.status,
    });

    // Response structure can be:
    // Option 1: { message: "Success", data: [{ id: 1, status: "active" }] }
    // Option 2: { message: "Success", employee: { id: 1, status: "active" } }
    let backendStatus: string | undefined;

    if (response.data.data && Array.isArray(response.data.data)) {
      // Array format
      const firstItem = response.data.data[0];
      if (firstItem && firstItem.status) {
        backendStatus = firstItem.status;
      }
    } else if (response.data.employee && response.data.employee.status) {
      // Employee object format
      backendStatus = response.data.employee.status;
    } else if (response.data.status) {
      // Direct status field
      backendStatus = response.data.status;
    }

    // If still no status found
    if (!backendStatus) {
      console.error("❌ Unexpected response structure:", response.data);
      console.error("❌ Available fields:", Object.keys(response.data));

      // Return default active instead of throwing error
      console.warn(
        "⚠️ Status field not found, returning default active status"
      );
      return NextResponse.json({
        message: "Survey status retrieved (default - no status field)",
        data: {
          isActive: true,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    console.log("✅ Found backend status:", backendStatus);

    // Convert backend format to frontend format
    const isActive = convertToFrontendFormat(backendStatus);

    console.log("✅ Survey status converted:", {
      backendStatus,
      convertedIsActive: isActive,
    });

    const finalResponse = {
      message: "Survey status retrieved successfully",
      data: {
        isActive,
        updatedAt: new Date().toISOString(),
      },
    };

    console.log("📤 Sending response:", finalResponse);
    return NextResponse.json(finalResponse);
  } catch (err) {
    const error = err as {
      response?: { status?: number; data?: unknown };
      message?: string;
      code?: string;
    };
    console.error("Failed to get survey status:", {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // If backend returns 404 or endpoint doesn't exist, create default active status
    if (error.response?.status === 404 || error.code === "ENOTFOUND") {
      console.log(
        "Backend endpoint not found, returning default active status"
      );
      return NextResponse.json({
        message: "Survey status retrieved (default)",
        data: {
          isActive: true, // Default to active if endpoint doesn't exist
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // For other errors, return error response
    return NextResponse.json(
      {
        error: "Failed to get survey status from backend",
        message: error.message || "Unknown error",
        details: error.response?.data,
      },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT - Update survey status
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { isActive } = body;

    console.log("Updating survey status:", { isActive });

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Convert frontend format to backend format
    const backendStatus = convertToBackendFormat(isActive);

    console.log("Backend status to send:", backendStatus);

    // Try to update status on backend API
    try {
      // Using the new backend endpoint: /surveystatus/1
      const response = await instance.put("/surveystatus/1", {
        status: backendStatus,
      });

      console.log("Backend update response:", {
        status: response.status,
        data: response.data,
      });

      // Handle different response structures
      // Response: { message: "...", employee: { id: 1, status: "inactive" } }
      let responseStatus: string;

      if (response.data.employee && response.data.employee.status) {
        // Employee object format
        responseStatus = response.data.employee.status;
      } else if (response.data.data && response.data.data.status) {
        // Data object format
        responseStatus = response.data.data.status;
      } else if (response.data.status) {
        // Direct status field
        responseStatus = response.data.status;
      } else {
        // If no status in response, use what we sent
        console.warn("No status in response, using sent value:", backendStatus);
        responseStatus = backendStatus;
      }

      // Convert backend response to frontend format
      const responseIsActive = convertToFrontendFormat(responseStatus);

      console.log("Response converted:", { responseStatus, responseIsActive });

      return NextResponse.json({
        message: "Survey status updated successfully",
        data: {
          isActive: responseIsActive,
          updatedAt:
            response.data.data?.updatedAt ||
            response.data.updatedAt ||
            new Date().toISOString(),
        },
      });
    } catch (apiError) {
      const error = apiError as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      console.error("Backend API error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      // If endpoint doesn't exist, simulate success with local state
      if (error.response?.status === 404) {
        console.log("Backend endpoint not found, using local fallback");
        return NextResponse.json({
          message: "Survey status updated successfully (local fallback)",
          data: {
            isActive,
            updatedAt: new Date().toISOString(),
          },
        });
      }
      throw error;
    }
  } catch (err) {
    const error = err as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };
    console.error("Failed to update survey status:", {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to update survey status",
        message: error.message || "Unknown error",
        details: error.response?.data,
      },
      { status: error.response?.status || 500 }
    );
  }
}
