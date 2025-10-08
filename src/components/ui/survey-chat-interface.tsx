// components/SurveyChatInterface.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, BarChart3, Trash2 } from "lucide-react";
import { useChatAnalyze } from "@/hooks/use-chat-analyze";
import MarkdownRenderer from "./markdown-renderer";

function TypingBubble() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="inline-block h-2 w-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="inline-block h-2 w-2 rounded-full bg-gray-500 animate-bounce" />
    </div>
  );
}

export function SurveyChatInterface({ onClose }: { onClose: () => void }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    clearMessages,
    isLoading,
    isStreaming,
    streamingText,
    messagesEndRef
  } = useChatAnalyze();

  const suggestedQuestions = [
    {
      icon: "📊",
      question: "Berapa persentase completion rate survey?",
      category: "Analytics"
    },
    {
      icon: "💰",
      question: "Apa tingkat kepuasan gaji karyawan?",
      category: "Salary"
    },
    {
      icon: "🏢",
      question: "Bagaimana kondisi lingkungan kerja fisik?",
      category: "Environment"
    },
    {
      icon: "👏",
      question: "Berapa banyak karyawan yang merasa dihargai?",
      category: "Recognition"
    },
    {
      icon: "📈",
      question: "Analisis tren respons survey terbaru",
      category: "Trends"
    }
  ];

  return (
    <Card className="flex flex-col h-[85vh] max-h-[800px] w-[95vw] sm:w-[90vw] md:w-[500px] lg:w-[600px] max-w-[600px] shadow-lg rounded-lg overflow-hidden border bg-white">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold text-gray-800">Survey Analytics</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
          >
            <Trash2 className="h-3.5 w-3.5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
            aria-label="Close chat"
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <p className="text-gray-500 text-sm">Tanyakan tentang data survey dan analisis</p>
              </div>

              <div className="w-full max-w-md">
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto px-3 py-2 text-xs rounded-lg border hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        const syntheticEvent = {
                          target: { value: item.question }
                        } as React.ChangeEvent<HTMLInputElement>;
                        handleInputChange(syntheticEvent);
                        setTimeout(() => {
                          const formEvent = {
                            preventDefault: () => { },
                            target: { value: item.question }
                          } as unknown as React.FormEvent<HTMLFormElement>;
                          handleSubmit(formEvent);
                        }, 100);
                      }}
                    >
                      <p className="text-gray-700">{item.question}</p>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`mb-6 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"} max-w-[85%]`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${message.role === "user" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>
                  {message.role === "user" ? "U" : "AI"}
                </div>

                <div className="flex-1">
                  <div
                    className={`p-4 rounded-xl ${message.role === "user"
                      ? "bg-black text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200"
                      }`}
                  >
                    <MarkdownRenderer content={message.content} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingText && (
            <div className="mb-6 flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-gray-200 text-gray-700">
                  AI
                </div>
                <div className="flex-1">
                  <div className="p-4 rounded-xl bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200">
                    <MarkdownRenderer content={streamingText} />
                    <span className="animate-pulse text-gray-500 font-bold ml-1">|</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {(status === "analyzing" || isLoading) && !isStreaming && (
            <div className="mb-6 flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-gray-200 text-gray-700">
                  AI
                </div>
                <div className="flex-1">
                  <div className="p-4 rounded-xl bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200">
                    <TypingBubble />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
          <Input
            placeholder="Message Survey Analytics..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-1 text-sm rounded-lg border focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="bg-black hover:bg-gray-800 text-white rounded-lg px-3 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Kirim pesan"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
