// components/ChatInterface.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, X } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import MarkdownRenderer from "./markdown-renderer";

type Role = "user" | "assistant";

// Kompatibel dengan dua bentuk pesan
type StringMessage = string;
type ObjectMessage = {
  role: Role;
  content: string;
  userAvatarUrl?: string;
  aiAvatarUrl?: string;
};
type ChatMessage = StringMessage | ObjectMessage;

function isObjectMessage(m: ChatMessage): m is ObjectMessage {
  return typeof m === "object" && m !== null && "content" in m;
}

function isUserMessage(m: ChatMessage) {
  if (isObjectMessage(m)) return m.role === "user";
  return m.startsWith("You:");
}

function getMessageContent(m: ChatMessage) {
  if (isObjectMessage(m)) return m.content;
  // hapus prefix "You: " jika ada
  return m.replace(/^You:\s*/, "");
}

function UserAvatar({ src }: { src?: string }) {
  return (
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarImage src={src ?? "/avatars/user.png"} alt="User" />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  );
}

function AiAvatar({ src }: { src?: string }) {
  return (
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarImage src={src ?? "/avatars/ai.png"} alt="AI" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
  );
}

// Bubble "typing…" animasi 3 dot
function TypingBubble() {
  return (
    <div
      className="flex-1 p-4 rounded-xl bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200"
      aria-live="polite"
      aria-label="AI is typing"
    >
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="inline-block h-2 w-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="inline-block h-2 w-2 rounded-full bg-gray-500 animate-bounce" />
      </div>
    </div>
  );
}

export function ChatInterface({ onClose }: { onClose: () => void }) {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat() as {
    messages: ChatMessage[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    status: "idle" | "submitted" | "streaming" | string;
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <Card className="flex flex-col h-[800px] w-[700px] shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-lg font-semibold">AI Chatbot</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {(!messages || messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p className="text-center">Mulai ngobrol dengan VoxBot.</p>
            </div>
          )}

          {messages?.map((m, idx) => {
            const user = isUserMessage(m);
            const content = getMessageContent(m);
            const userAvatarUrl = isObjectMessage(m) ? m.userAvatarUrl : undefined;
            const aiAvatarUrl = isObjectMessage(m) ? m.aiAvatarUrl : undefined;

            // Layout:
            // - AI:   [Avatar] [Bubble]
            // - User: [Bubble] [Avatar]
            return (
              <div key={idx} className={`mb-6 flex ${user ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start gap-3 ${user ? "flex-row-reverse" : "flex-row"} max-w-[85%]`}>
                  {user ? <UserAvatar src={userAvatarUrl} /> : <AiAvatar src={aiAvatarUrl} />}

                  <div
                    className={`flex-1 p-4 rounded-xl ${user
                        ? "bg-black text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200"
                      }`}
                  >
                    <MarkdownRenderer content={content} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator saat streaming */}
          {status === "streaming" && (
            <div className="mb-6 flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <AiAvatar />
                <TypingBubble />
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Ketik pesan Anda..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading} size="icon" aria-label="Kirim pesan">
            {isLoading ? <span className="animate-spin">...</span> : <Send className="h-5 w-5" />}
            <span className="sr-only">Kirim</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
