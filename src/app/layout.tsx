import type { Metadata } from "next";
import "./globals.css";
import { SurveyConfigProvider } from "@/context/survey-config-context";
import QueryProvider from "@/providers/query-providers";
import { SurveyAnswerProvider } from "@/context/survey-answer-context";

export const metadata: Metadata = {
  title: "Annual Survey ",
  description: "Annual Survey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-[system-ui,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol'] antialiased"
      >
        <QueryProvider>
          <SurveyConfigProvider>
            <SurveyAnswerProvider>
              {children}
            </SurveyAnswerProvider>
          </SurveyConfigProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
