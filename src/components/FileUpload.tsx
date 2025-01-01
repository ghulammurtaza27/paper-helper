'use client';
import { useState } from 'react';

interface FileUploadProps {
  onFileUpload: (plan: any) => void;
  onStartProcessing: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function FileUpload({ onFileUpload, onStartProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    onStartProcessing();

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 10MB.');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-paper', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.error || 'Failed to process file');
      }

      // Validate the response structure
      if (!data || !data.title || !Array.isArray(data.sections)) {
        console.error('Invalid response structure:', data);
        throw new Error('Received invalid study plan format');
      }

      onFileUpload(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process the file. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <div
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept=".txt,.pdf"
          disabled={isLoading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            ) : (
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
            <div className="text-lg">
              {isLoading 
                ? 'Processing your file...'
                : 'Drag and drop your file here, or browse'
              }
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, TXT
            </p>
          </div>
        </label>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 