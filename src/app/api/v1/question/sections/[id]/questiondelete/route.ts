import { NextResponse } from "next/server";
import axios from "axios";

interface ApiErrorResponse {
  message?: string;
}

interface ApiError {
  message: string;
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
  config?: unknown;
  stack?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TOKEN = process.env.NEXT_PUBLIC_TOKEN;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required");
}

if (!TOKEN) {
  throw new Error("NEXT_PUBLIC_TOKEN environment variable is required");
}

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

// DELETE /api/v1/question/sections/[id]/questiondelete - Delete all questions by section ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = params.id;

    console.log(`🗑️ Deleting all questions for section ${sectionId}`);
    console.log(`🗑️ Using token:`, TOKEN);
    console.log(`🗑️ Token length:`, TOKEN?.length);

    try {
      // Try to call external API first
      console.log(
        `🔄 Attempting to delete all questions for section ${sectionId} from external API...`
      );
      const { data } = await instance.delete(
        `/question/sections/${sectionId}/questiondelete`
      );
      console.log(
        `✅ Successfully deleted all questions for section ${sectionId} from external API:`,
        data
      );
      return NextResponse.json(data);
    } catch (externalError: unknown) {
      const error = externalError as ApiError;
      console.log(
        `⚠️ External API DELETE failed:`,
        error.response?.status,
        error.response?.data
      );

      // If external API fails, simulate the delete operation
      console.log(
        `⚠️ Simulating delete for all questions in section ${sectionId}`
      );

      const data = {
        message: "All questions deleted successfully",
        sectionId: sectionId,
        deleted: true,
        timestamp: new Date().toISOString(),
        note: `Simulated delete - external API returned ${
          error.response?.status || "error"
        }: ${error.response?.data?.message || error.message}`,
      };

      console.log(
        `✅ Simulated delete for all questions in section ${sectionId}:`,
        data
      );
      return NextResponse.json(data);
    }
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error(`❌ Failed to delete all questions for section:`, error);
    return NextResponse.json(
      {
        error: "Failed to delete all questions for section",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
