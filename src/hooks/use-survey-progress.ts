"use client";

import { useState, useEffect, useCallback } from "react";

export interface SurveyProgressData {
  employeeId: string;
  employeeName: string;
  currentSectionId: string;
  answers: Record<string, string | string[]>;
  completedSections: string[];
  startTime: string;
  lastUpdated: string;
}

const SURVEY_PROGRESS_KEY = "survey_progress";

export const useSurveyProgress = () => {
  const [progressData, setProgressData] = useState<SurveyProgressData | null>(
    null
  );

  // Clear all progress data
  const clearProgress = useCallback(() => {
    setProgressData(null);
    localStorage.removeItem(SURVEY_PROGRESS_KEY);
  }, []);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(SURVEY_PROGRESS_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgressData(parsed);
      } catch (error) {
        console.error("Error parsing survey progress:", error);
        // Clear progress directly without using the callback to avoid circular dependency
        setProgressData(null);
        localStorage.removeItem(SURVEY_PROGRESS_KEY);
      }
    }
  }, []); // Empty dependency array since this should only run once on mount

  // Initialize survey progress for new employee
  const initializeProgress = (
    employeeId: string,
    employeeName: string,
    firstSectionId: string
  ) => {
    const newProgress: SurveyProgressData = {
      employeeId,
      employeeName,
      currentSectionId: firstSectionId,
      answers: {},
      completedSections: [],
      startTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setProgressData(newProgress);
    localStorage.setItem(SURVEY_PROGRESS_KEY, JSON.stringify(newProgress));
  };

  // Save answer for specific question
  const saveAnswer = useCallback(
    (questionId: string, answer: string | string[]) => {
      if (!progressData) return;

      const updatedProgress = {
        ...progressData,
        answers: {
          ...progressData.answers,
          [questionId]: answer,
        },
        lastUpdated: new Date().toISOString(),
      };

      setProgressData(updatedProgress);
      localStorage.setItem(
        SURVEY_PROGRESS_KEY,
        JSON.stringify(updatedProgress)
      );
    },
    [progressData]
  );

  // Mark section as completed
  const markSectionCompleted = useCallback(
    (sectionId: string) => {
      if (!progressData) return;

      const updatedProgress = {
        ...progressData,
        completedSections: [
          ...new Set([...progressData.completedSections, sectionId]),
        ],
        lastUpdated: new Date().toISOString(),
      };

      setProgressData(updatedProgress);
      localStorage.setItem(
        SURVEY_PROGRESS_KEY,
        JSON.stringify(updatedProgress)
      );
    },
    [progressData]
  );

  // Update current section
  const updateCurrentSection = useCallback(
    (sectionId: string) => {
      if (!progressData) return;

      const updatedProgress = {
        ...progressData,
        currentSectionId: sectionId,
        lastUpdated: new Date().toISOString(),
      };

      setProgressData(updatedProgress);
      localStorage.setItem(
        SURVEY_PROGRESS_KEY,
        JSON.stringify(updatedProgress)
      );
    },
    [progressData]
  );

  // Get answer for specific question
  const getAnswer = (questionId: string): string | string[] | undefined => {
    return progressData?.answers[questionId];
  };

  // Check if section is completed
  const isSectionCompleted = (sectionId: string): boolean => {
    return progressData?.completedSections.includes(sectionId) || false;
  };

  // Get completed sections count
  const getCompletedSectionsCount = (): number => {
    return progressData?.completedSections.length || 0;
  };

  // Check if survey is in progress
  const isSurveyInProgress = (): boolean => {
    return progressData !== null;
  };

  // Get survey duration
  const getSurveyDuration = (): string => {
    if (!progressData) return "0 minutes";

    const start = new Date(progressData.startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  return {
    progressData,
    initializeProgress,
    saveAnswer,
    markSectionCompleted,
    updateCurrentSection,
    getAnswer,
    isSectionCompleted,
    getCompletedSectionsCount,
    clearProgress,
    isSurveyInProgress,
    getSurveyDuration,
  };
};
