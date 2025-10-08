// lib/prompts.ts
// Centralized prompts for Gemini AI

export interface SurveyData {
  surveyData: any;
  questionsData: any;
}

export const createSurveyAnalysisPrompt = (
  message: string,
  data: SurveyData
) => {
  const { surveyData, questionsData } = data;

  return `
You are an AI assistant specialized in analyzing employee survey data. You can help administrators understand survey results, calculate statistics, and provide insights.

SURVEY DATA CONTEXT:
${surveyData ? JSON.stringify(surveyData, null, 2) : "No survey data available"}

QUESTIONS DATA:
${
  questionsData
    ? JSON.stringify(questionsData, null, 2)
    : "No questions data available"
}

ANALYSIS CAPABILITIES:
- Calculate response rates and completion percentages
- Analyze satisfaction levels across different categories
- Compare responses between different sections
- Identify trends and patterns in the data
- Provide statistical insights and recommendations
- Answer questions about specific survey questions or responses

When analyzing data, please:
1. Use the actual survey data provided above
2. Calculate specific numbers and percentages
3. Provide actionable insights
4. Be specific about which questions or sections you're analyzing
5. If data is not available, explain what information would be needed

User Question: ${message}
`;
};

export const createGeneralChatPrompt = (message: string) => {
  return `
You are a helpful AI assistant for a survey management system. You can help users with:

- General questions about the survey system
- Technical support and troubleshooting
- Best practices for survey design
- Data analysis guidance
- System usage tips

Please provide helpful, accurate, and concise responses.

User Question: ${message}
`;
};

export const createTestPrompt = () => {
  return "Hello, can you respond with 'API is working'?";
};

export const createFallbackPrompt = () => {
  return `I apologize, but I'm currently unable to access the Gemini AI service to analyze your survey data. This could be due to:

1. **API Configuration Issue**: The Gemini API key may not be properly configured
2. **Model Availability**: The requested models (gemini-2.5-flash, gemini-1.5-pro, etc.) may not be available
3. **Service Outage**: There might be a temporary service disruption

**What I can tell you about your survey data:**
- Survey data is being fetched successfully from your API
- The system is working correctly for data collection
- Charts and analytics are functioning properly

**To resolve this:**
- Check your GEMINI_API_KEY environment variable
- Verify your Google Cloud API permissions for Gemini API
- Ensure you have access to gemini-2.5-flash model
- Try again in a few minutes if it's a temporary issue

**Test your API configuration:**
You can test your Gemini API setup by visiting: /api/test-gemini

Would you like me to help you with anything else about your survey system?`;
};

export const createErrorPrompt = (errorType: string, details?: string) => {
  const baseError = `I encountered an error while processing your request.`;

  switch (errorType) {
    case "API_KEY":
      return `${baseError} The Gemini API key is not properly configured. Please check your environment variables.`;

    case "QUOTA":
      return `${baseError} The API quota has been exceeded. Please try again later or check your usage limits.`;

    case "MODEL_UNAVAILABLE":
      return `${baseError} The requested AI model is not available. Please try again later.`;

    case "NETWORK":
      return `${baseError} There was a network connectivity issue. Please check your internet connection.`;

    default:
      return `${baseError} ${details || "Please try again later."}`;
  }
};

export const createSystemPrompts = {
  surveyAnalysis: createSurveyAnalysisPrompt,
  generalChat: createGeneralChatPrompt,
  test: createTestPrompt,
  fallback: createFallbackPrompt,
  error: createErrorPrompt,
};
