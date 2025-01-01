'use client';
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import StudyPlan from "@/components/StudyPlan";

interface StudyPlanData {
  title: string;
  sections: Array<{
    topic: string;
    timeRequired: string;
    description: string;
    prerequisites: string[];
    resources: Array<{
      title: string;
      url: string;
      difficulty: "beginner" | "intermediate" | "advanced";
    }>;
    exercises: Array<{
      question: string;
      type: string;
      hint: string;
      details?: {
        equations?: string[];        // For storing mathematical equations
        matrixData?: number[][];    // For storing matrix data
        expectedOutput?: string;    // Expected solution or output format
        sampleInput?: string;      // Sample input if needed
      };
    }>;
  }>;
}

// Update Exercise component to show mathematical content
const Exercise = ({ exercise }: { exercise: StudyPlanData['sections'][0]['exercises'][0] }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="p-4 bg-gray-900 rounded-lg space-y-3">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-3">
          <p className="text-white text-lg">{exercise.question}</p>
          {exercise.details?.equations && (
            <div className="mt-3 p-3 bg-gray-800 rounded">
              {exercise.details.equations.map((eq, i) => (
                <div key={i} className="text-gray-200 font-mono">
                  {eq}
                </div>
              ))}
            </div>
          )}
          {exercise.details?.matrixData && (
            <div className="mt-3 p-3 bg-gray-800 rounded font-mono">
              {exercise.details.matrixData.map((row, i) => (
                <div key={i} className="text-gray-200">
                  [{row.join(', ')}]
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md text-sm">
          {exercise.type}
        </span>
      </div>
      <div>
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
        >
          {showHint ? 'Hide Hint' : 'Show Hint'}
          <svg
            className={`w-4 h-4 transform transition-transform ${showHint ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showHint && (
          <p className="mt-2 text-gray-400 text-sm italic">
            💡 {exercise.hint}
          </p>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStudyPlan = (plan: StudyPlanData) => {
    setIsProcessing(false);
    setStudyPlan(plan);
  };

  const handleStartProcessing = () => {
    setIsProcessing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <main className="flex flex-col gap-8 items-center">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              Paper Study Plan Generator
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              Upload an academic paper and get a personalized study plan with curated resources and exercises
            </p>
          </div>

          {/* Main Content */}
          <div className="w-full">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-6 p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full animate-spin">
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 dark:border-blue-400 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    Analyzing your paper...
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Creating a personalized study plan
                  </p>
                </div>
              </div>
            ) : !studyPlan ? (
              <FileUpload 
                onFileUpload={handleStudyPlan} 
                onStartProcessing={handleStartProcessing}
              />
            ) : (
              <div className="space-y-6">
                <StudyPlan plan={studyPlan} />
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setStudyPlan(null);
                      setIsProcessing(false);
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Analyze Another Paper
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">
              Made with AI to help students learn better
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
