// components/SurveyChatInterface.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, X, BarChart3, Trash2 } from "lucide-react";
import { useChatAnalyze } from "@/hooks/use-chat-analyze";
import MarkdownRenderer from "./markdown-renderer";

function UserAvatar() {
  return (
    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-purple-200 shadow-md">
      <AvatarImage src="/avatars/user.png" alt="User" />
      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold text-sm border border-purple-300">
        U
      </AvatarFallback>
    </Avatar>
  );
}

function AiAvatar() {
  return (
    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-purple-200 shadow-md">
      <AvatarImage src="/avatars/ai.png" alt="AI" />
      <AvatarFallback className="bg-gradient-to-br from-purple-200 to-purple-300 text-purple-700 font-semibold text-sm border border-purple-400">
        AI
      </AvatarFallback>
    </Avatar>
  );
}

function TypingBubble() {
  return (
    <div className="max-w-[75%] p-3 rounded-lg bg-purple-50 text-purple-600">
      <div className="flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.2s]" />
        <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.1s]" />
        <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
      </div>
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
    <Card className="flex flex-col h-[800px] w-[700px] shadow-2xl rounded-2xl overflow-hidden border-0 bg-white">
      <CardHeader className="flex flex-row items-center justify-between p-6 border-b bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-200 rounded-xl">
            <BarChart3 className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-purple-700">Survey Analytics AI</CardTitle>
            <p className="text-sm text-purple-600">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-200 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-200 rounded-xl"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="text-center mb-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <BarChart3 className="h-10 w-10 text-purple-700" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-purple-700 mb-2">Survey Analytics Assistant</h3>
                <p className="text-purple-600 text-lg">Tanyakan tentang data survey, analisis, dan insights</p>
              </div>

              <div className="w-full max-w-lg">
                <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Pertanyaan yang sering ditanyakan:</p>
                <div className="grid grid-cols-1 gap-3">
                  {suggestedQuestions.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
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
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                          {item.icon}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-purple-800 text-sm">{item.question}</p>
                          <p className="text-xs text-purple-500">{item.category}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`mb-6 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"} max-w-[85%]`}>
                {message.role === "user" ? <UserAvatar /> : <AiAvatar />}

                <div className="flex-1">
                  <div
                    className={`p-4 rounded-2xl whitespace-pre-wrap break-words shadow-sm ${message.role === "user"
                      ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 border border-purple-300 rounded-br-md"
                      : "bg-white text-gray-800 border border-purple-200 rounded-bl-md"
                      }`}
                  >
                    <MarkdownRenderer
                      className={`prose prose-sm max-w-none ${message.role === "user" ? "prose-invert" : ""
                        }`}
                      content={message.content}
                    />
                  </div>

                  {message.role === "assistant" && (
                    <div className="mt-3 flex items-center gap-2">
                      {message.hasData && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200 rounded-full px-3 py-1">
                          📊 Data Survey
                        </Badge>
                      )}
                      {message.isFallback && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 bg-orange-50 rounded-full px-3 py-1">
                          ⚠️ Fallback Response
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className={`text-xs text-gray-400 mt-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingText && (
            <div className="mb-6 flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <AiAvatar />
                <div className="flex-1">
                  <div className="p-4 rounded-2xl bg-white text-gray-800 border border-purple-200 rounded-bl-md shadow-sm">
                    <MarkdownRenderer
                      className="prose prose-sm max-w-none"
                      content={streamingText}
                    />
                    <span className="animate-pulse text-purple-500 font-bold">|</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50 rounded-full px-3 py-1">
                      ✨ Streaming...
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {(status === "analyzing" || isLoading) && !isStreaming && (
            <div className="mb-6 flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <AiAvatar />
                <div className="flex-1">
                  <div className="p-4 rounded-2xl bg-white text-gray-800 border border-purple-200 rounded-bl-md shadow-sm">
                    <TypingBubble />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs text-purple-600 border-purple-300 bg-purple-50 rounded-full px-3 py-1">
                      🤖 AI sedang berpikir...
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-6 border-t bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <form onSubmit={handleSubmit} className="flex w-full gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Tanyakan tentang data survey..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:ring-0 transition-all duration-200 bg-white shadow-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Kirim pesan"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
