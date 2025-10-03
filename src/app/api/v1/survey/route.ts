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

export async function POST(req: Request) {
  try {
    console.log("➡️ Using token:", TOKEN);

    const body = await req.json();
    console.log("📝 Survey submission data:", body);

    // Add timestamp to the request body
    const currentDate = new Date();
    const formattedDate = currentDate
      .toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", " -");

    // Ensure conclutionResult has a default value
    const processedBody = {
      ...body,
      conclutionResult: body.conclutionResult || "submit",
    };

    const bodyWithTimestamp = {
      ...processedBody,
      submittedAt: formattedDate,
      timestamp: currentDate.toISOString(),
    };

    console.log("📝 Survey submission data with timestamp:", bodyWithTimestamp);

    // Ensure the data structure is consistent before sending to backend
    const surveyResultArray = Array.isArray(bodyWithTimestamp.surveyResult)
      ? bodyWithTimestamp.surveyResult
      : [bodyWithTimestamp.surveyResult];

    // Ensure each survey result has conclutionResult
    const processedSurveyResult = surveyResultArray.map((result) => ({
      ...result,
      conclutionResult: result.conclutionResult || "submit",
    }));

    const finalPayload = {
      ...bodyWithTimestamp,
      surveyResult: processedSurveyResult,
    };

    console.log("📝 Final payload to backend:", finalPayload);

    const { data } = await instance.post("/survey", finalPayload);
    console.log("✅ Survey submitted successfully:", data);

    // Return the response with timestamp included
    const responseWithTimestamp = {
      ...data,
      submittedAt: formattedDate,
      timestamp: currentDate.toISOString(),
    };

    return NextResponse.json(responseWithTimestamp);
  } catch (err: any) {
    console.error(
      "Failed to submit survey:",
      err.response?.status,
      err.response?.data || err.message
    );
    return NextResponse.json(
      { error: "Failed to submit survey" },
      { status: err.response?.status || 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("➡️ Using token:", TOKEN);

    const { data } = await instance.get("/survey");
    console.log("📊 Raw survey data from API:", data);

    // Transform the data to include proper structure with timestamps
    if (data && data.data && Array.isArray(data.data)) {
      const transformedData = data.data.map((employee: any) => {
        if (employee.surveyResult && Array.isArray(employee.surveyResult)) {
          // If surveyResult is already in the new format with date field
          const transformedResults = employee.surveyResult.map(
            (result: any) => {
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
            }
          );

          return {
            ...employee,
            surveyResult: transformedResults,
          };
        }
        return employee;
      });

      const response = {
        message: data.message || "Success",
        data: transformedData,
      };

      console.log("📊 Transformed survey data:", response);
      return NextResponse.json(response);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(
      "Failed to fetch survey data:",
      err.response?.status,
      err.response?.data || err.message
    );
    return NextResponse.json(
      { error: "Failed to fetch survey data" },
      { status: err.response?.status || 500 }
    );
  }
}
