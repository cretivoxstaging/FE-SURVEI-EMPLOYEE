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
    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-indigo-200 shadow-md">
      <AvatarImage src="/avatars/user.png" alt="User" />
      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm">
        U
      </AvatarFallback>
    </Avatar>
  );
}

function AiAvatar() {
  return (
    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-purple-200 shadow-md">
      <AvatarImage src="/avatars/ai.png" alt="AI" />
      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm">
        AI
      </AvatarFallback>
    </Avatar>
  );
}

function TypingBubble() {
  return (
    <div className="max-w-[75%] p-3 rounded-lg bg-gray-100 text-gray-600">
      <div className="flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]" />
        <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.1s]" />
        <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
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
      <CardHeader className="flex flex-row items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Survey Analytics AI</CardTitle>
            <p className="text-sm text-white/80">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearMessages}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
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
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Survey Analytics Assistant</h3>
                <p className="text-gray-600 text-lg">Tanyakan tentang data survey, analisis, dan insights</p>
              </div>
              
              <div className="w-full max-w-lg">
                <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Pertanyaan yang sering ditanyakan:</p>
                <div className="grid grid-cols-1 gap-3">
                  {suggestedQuestions.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-4 rounded-xl border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
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
                          <p className="font-medium text-gray-800 text-sm">{item.question}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
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
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md"
                      : "bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-md"
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
                  <div className="p-4 rounded-2xl bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-md shadow-sm">
                    <MarkdownRenderer
                      className="prose prose-sm max-w-none"
                      content={streamingText}
                    />
                    <span className="animate-pulse text-indigo-500 font-bold">|</span>
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
          {status === "analyzing" && !isStreaming && (
            <div className="mb-6 flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <AiAvatar />
                <div className="flex-1">
                  <div className="p-4 rounded-2xl bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-md shadow-sm">
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

      <CardFooter className="p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <form onSubmit={handleSubmit} className="flex w-full gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Tanyakan tentang data survey..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-white shadow-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            size="icon" 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
