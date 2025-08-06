import type { Metadata } from "next";
import "./globals.css";
import { SurveyProvider } from "@/context/survey-context";
import QueryProvider from "@/providers/query-providers";

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
          <SurveyProvider>
            {children}
          </SurveyProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
