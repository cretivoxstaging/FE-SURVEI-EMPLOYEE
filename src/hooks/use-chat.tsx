// hooks/useChat.ts
import { useRef, useState } from "react";

export function useChat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<"" | "submitted" | "streaming" | "stopped" | "error">("");
  const abortRef = useRef<AbortController | null>(null);

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 1) Tambah pesan user
    const userText = input;
    setMessages((prev) => [...prev, `You: ${userText}`]);
    setInput("");
    setStatus("submitted");

    // 2) Mulai fetch stream
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // fallback: coba baca JSON error kalau route non-stream
        try {
          const data = await res.json();
          throw new Error(data?.error || `HTTP ${res.status}`);
        } catch {
          throw new Error(`HTTP ${res.status}`);
        }
      }

      // 3) Siapkan bubble Gemini kosong
      setMessages((prev) => [...prev, ""]);
      setStatus("streaming");

      // 4) Baca stream teks
      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Append chunk ke pesan terakhir (Gemini)
          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (lastIdx >= 0 && copy[lastIdx].startsWith("")) {
              copy[lastIdx] = copy[lastIdx] + chunk;
            }
            return copy;
          });
        }
      }

      setStatus("");
    } catch (err: any) {
      if (controller.signal.aborted) {
        setStatus("stopped");
        // optional: tambahkan tanda dibatalkan
        setMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].startsWith("")) {
            copy[lastIdx] = copy[lastIdx] + " [stopped]";
          }
          return copy;
        });
      } else {
        setStatus("error");
        const msg = err?.message || "Unknown error";
        setMessages((prev) => [...prev, `Gemini: Error - ${msg}`]);
      }
    } finally {
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStatus("stopped");
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
  };
}
