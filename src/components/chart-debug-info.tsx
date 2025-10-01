"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Info, Settings } from "lucide-react";

interface DebugInfo {
  salaryQuestion: {
    id: number;
    sectionTitle: string;
    question: string;
    options: string[];
  } | null;
  environmentQuestion: {
    id: number;
    sectionTitle: string;
    question: string;
    options: string[];
  } | null;
  appreciationQuestion: {
    id: number;
    sectionTitle: string;
    question: string;
    options: string[];
  } | null;
}

interface ChartDebugInfoProps {
  debugInfo: DebugInfo | null;
}

export function ChartDebugInfo({ debugInfo }: ChartDebugInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const questions = [
    { key: 'salaryQuestion', title: 'Salary Chart', icon: '💰' },
    { key: 'environmentQuestion', title: 'Physical Work Environment Chart', icon: '🏢' },
    { key: 'appreciationQuestion', title: 'Appreciation Chart', icon: '👏' }
  ];

  // Count how many questions are found
  const foundQuestions = debugInfo ? Object.values(debugInfo).filter(q => q !== null).length : 0;
  const totalQuestions = 3;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings className="h-4 w-4 mr-2" />
          Chart Configuration
          {foundQuestions < totalQuestions && (
            <AlertCircle className="h-3 w-3 ml-2 text-blue-500" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Chart Data Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!debugInfo ? (
            <div className="flex items-center gap-2 text-gray-600 p-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading chart configuration...</span>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Configuration Status</span>
                </div>
                <div className="text-sm text-gray-700">
                  {foundQuestions} of {totalQuestions} charts are properly configured
                </div>
                {foundQuestions < totalQuestions && (
                  <div className="text-xs text-blue-600 mt-1">
                    Some charts may not display data correctly
                  </div>
                )}
              </div>

              {/* Questions Details */}
              <div className="space-y-4">
                {questions.map(({ key, title, icon }) => {
                  const question = debugInfo[key as keyof DebugInfo];
                  const isFound = question !== null;

                  return (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-medium">{title}</span>
                        {isFound ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>

                      {isFound ? (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600">
                            <strong>ID:</strong> {question.id} | <strong>Section:</strong> {question.sectionTitle}
                          </div>
                          <div className="text-xs text-gray-700">
                            <strong>Question:</strong> {question.question}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {question.options.map((option, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-red-600">
                          No matching question found for this chart. Please check your survey questions.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">How it works:</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Charts automatically find questions based on section titles</li>
                  <li>• Salary chart looks for sections containing &quot;salary&quot;</li>
                  <li>• Environment chart looks for &quot;physical work environment&quot;</li>
                  <li>• Appreciation chart looks for &quot;appreciated&quot;</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
