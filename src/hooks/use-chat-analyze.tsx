// hooks/useChatAnalyze.tsx
import { useRef, useState, useEffect } from "react";

export function useChatAnalyze() {
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    hasData?: boolean;
    isFallback?: boolean;
  }>>([]);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<"" | "submitted" | "analyzing" | "error">("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "analyzing" || isStreaming;

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingText]);

  // Auto scroll when streaming
  useEffect(() => {
    if (isStreaming && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamingText, isStreaming]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const messageId = Date.now().toString();

    // Add user message
    setMessages((prev) => [...prev, {
      id: messageId,
      role: "user",
      content: userMessage,
      timestamp: new Date()
    }]);
    setInput("");
    setStatus("submitted");

    // Start analysis
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setStatus("analyzing");

      // Check if response is streaming or complete
      if (data.streaming) {
        // Handle streaming response
        setIsStreaming(true);
        setStreamingText("");

        // Simulate streaming effect for better UX
        const fullText = data.response;
        let currentIndex = 0;

        const streamInterval = setInterval(() => {
          if (currentIndex < fullText.length) {
            setStreamingText(fullText.substring(0, currentIndex + 1));
            currentIndex += Math.max(1, Math.floor(Math.random() * 3) + 1); // Variable speed
          } else {
            clearInterval(streamInterval);
            setIsStreaming(false);

            // Add final message
            setMessages((prev) => [...prev, {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: fullText,
              timestamp: new Date(),
              hasData: data.hasData,
              isFallback: data.fallback || false
            }]);

            setStreamingText("");
            setStatus("");
          }
        }, 30); // 30ms delay between characters

      } else {
        // Handle complete response
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          hasData: data.hasData,
          isFallback: data.fallback || false
        }]);
        setStatus("");
      }
    } catch (err: any) {
      if (controller.signal.aborted) {
        setStatus("error");
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Analysis was cancelled.",
          timestamp: new Date()
        }]);
      } else {
        setStatus("error");
        const errorMsg = err?.message || "Unknown error occurred";
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${errorMsg}`,
          timestamp: new Date()
        }]);
      }
    } finally {
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStatus("error");
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    clearMessages,
    isLoading,
    isStreaming,
    streamingText,
    messagesEndRef
  };
}
