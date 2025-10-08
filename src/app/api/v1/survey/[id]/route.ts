import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://hris-api-kappa.vercel.app/api/v1";
const TOKEN =
  process.env.NEXT_PUBLIC_TOKEN ||
  "$2a$12$JSyMjCxUTNmGBlAQOQQeaOFrOdtdUmn.U/17DlvOK1t.Ot0BTRGli";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("➡️ Fetching survey by ID:", params.id);
    console.log("➡️ Using token:", TOKEN);

    const { data } = await instance.get(`/survey/${params.id}`);
    console.log("📊 Raw survey data by ID from API:", data);

    // Transform the data to include proper structure with timestamps
    if (data && data.data) {
      const employee = data.data;

      if (employee.surveyResult && Array.isArray(employee.surveyResult)) {
        // If surveyResult is already in the new format with date field
        const transformedResults = employee.surveyResult.map((result: any) => {
          if (result.date) {
            // Already in correct format
            return result;
          } else {
            // Transform old format to new format
            return {
              date: new Date()
                .toLocaleString("en-US", {
                  timeZone: "Asia/Jakarta",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
                .replace(",", " -"),
              dataResult: result,
              conclutionResult: "submit",
            };
          }
        });

        const transformedEmployee = {
          ...employee,
          surveyResult: transformedResults,
        };

        const response = {
          message: data.message || "Success",
          data: transformedEmployee,
        };

        console.log("📊 Transformed survey data by ID:", response);
        return NextResponse.json(response);
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(
      "Failed to fetch survey data by ID:",
      err.response?.status,
      err.response?.data || err.message
    );
    return NextResponse.json(
      { error: "Failed to fetch survey data by ID" },
      { status: err.response?.status || 500 }
    );
  }
}
