/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/chat/route.ts
import { genAI } from "@/lib/gemini";

export const runtime = "edge"; // optional, biar low-latency di Vercel Edge

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContentStream({ contents: [{ role: "user", parts: [{ text: prompt }]}] });

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk?.text?.() ?? "";
            if (chunkText) controller.enqueue(encoder.encode(chunkText));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
      cancel(reason) {
        // Optional: handle abort
        console.warn("Client cancelled stream:", reason);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8", // plain streaming; gampang dibaca di client
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no", // Nginx proxies: disable buffering
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
