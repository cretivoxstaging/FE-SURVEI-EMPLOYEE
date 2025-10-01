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

    const { data } = await instance.post("/survey", body);
    console.log("✅ Survey submitted successfully:", data);
    return NextResponse.json(data);
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
