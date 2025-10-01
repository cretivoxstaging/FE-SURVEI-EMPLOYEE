import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { apiClient } from "@/lib/api-client";
import { createSystemPrompts } from "@/lib/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch survey data
    let surveyData = null;
    let questionsData = null;

    try {
      // Get survey results
      const surveyResponse = await apiClient.get("/api/v1/survey");
      surveyData = surveyResponse.data;

      // Get questions data
      const questionsResponse = await apiClient.get("/api/v1/question");
      questionsData = questionsResponse.data;
    } catch (apiError) {
      console.error("Error fetching survey data:", apiError);
      // Continue without data if API fails
    }

    // Prepare context for Gemini using centralized prompt
    const context = createSystemPrompts.surveyAnalysis(message, {
      surveyData,
      questionsData,
    });

    // Try different models in order of preference
    let model;
    let result;

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro",
    ];

    let lastError;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        });

        result = await model.generateContent(context);
        console.log(`Successfully used model: ${modelName}`);
        break; // Success, exit the loop
      } catch (modelError: any) {
        console.log(`Model ${modelName} failed:`, modelError.message);
        lastError = modelError;
        continue; // Try next model
      }
    }

    if (!result) {
      throw new Error(
        `All models failed. Last error: ${
          lastError?.message || "Unknown error"
        }`
      );
    }

    return NextResponse.json({
      response: result.response.text(),
      hasData: !!surveyData,
      dataTimestamp: new Date().toISOString(),
      streaming: true, // Enable streaming animation
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // More specific error handling
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        {
          error: "Gemini API key not configured properly",
        },
        { status: 500 }
      );
    }

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        {
          error: "Gemini API quota exceeded",
        },
        { status: 429 }
      );
    }

    if (error.message?.includes("All models failed")) {
      // Return a fallback response instead of error
      return NextResponse.json({
        response: createSystemPrompts.fallback(),
        hasData: false,
        dataTimestamp: new Date().toISOString(),
        fallback: true,
        streaming: true, // Enable streaming for fallback too
      });
    }

    return NextResponse.json(
      {
        error: "Failed to analyze survey data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
