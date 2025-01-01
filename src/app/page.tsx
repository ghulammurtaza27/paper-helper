'use client';
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import StudyPlan from "@/components/StudyPlan";

interface StudyPlanData {
  title: string;
  sections: Array<{
    topic: string;
    timeRequired: string;
    resources: Array<{
      title: string;
      url: string;
    }>;
    exercises: Array<{
      question: string;
      type: string;
    }>;
  }>;
}

export default function Home() {
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStudyPlan = (plan: StudyPlanData) => {
    console.log('Received study plan:', plan); // Debug log
    setIsProcessing(false);
    setStudyPlan(plan);
  };

  const handleStartProcessing = () => {
    setIsProcessing(true);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold text-center">
          Paper Study Plan Generator
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Upload an academic paper and get a personalized study plan with resources and exercises
        </p>
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <p>Processing your paper...</p>
          </div>
        ) : !studyPlan ? (
          <FileUpload 
            onFileUpload={handleStudyPlan} 
            onStartProcessing={handleStartProcessing}
          />
        ) : (
          <div className="w-full">
            <StudyPlan plan={studyPlan} />
            <button
              onClick={() => {
                setStudyPlan(null);
                setIsProcessing(false);
              }}
              className="mt-8 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Upload Another Paper
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
