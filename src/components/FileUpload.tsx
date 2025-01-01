'use client';
import { useState } from 'react';

interface FileUploadProps {
  onFileUpload: (plan: any) => void;
  onStartProcessing: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
};

export default function FileUpload({ onFileUpload, onStartProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  };

  const generatePreview = async (file: File) => {
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else if (file.type === 'text/plain') {
      const text = await file.text();
      setFilePreview(text.slice(0, 200) + '...');
    }
  };

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const processFile = async (file: File) => {
    const fileHash = await calculateFileHash(file);
    
    setError(null);
    onStartProcessing();

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    const fileType = file.type;
    if (!Object.keys(ACCEPTED_MIME_TYPES).includes(fileType)) {
      setError('Invalid file type. Please upload PDF or TXT files only.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hash', fileHash);

      const response = await fetch('/api/process-paper', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.error || 'Failed to process file');
      }

      if (!data || !data.title || !Array.isArray(data.sections)) {
        console.error('Invalid response structure:', data);
        throw new Error('Received invalid study plan format');
      }

      onFileUpload(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process the file. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
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
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`
          relative overflow-hidden
          p-16 border-2 border-dashed rounded-3xl 
          transition-all duration-300 ease-in-out
          bg-gradient-to-b from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40
          backdrop-blur-xl backdrop-saturate-150
          shadow-[inset_0_0_8px_rgba(0,0,0,0.05)]
          dark:shadow-[inset_0_0_8px_rgba(255,255,255,0.05)]
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[0.99] shadow-lg' 
            : 'border-gray-300/50 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0 bg-grid-gray-900/[0.2] [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-[0.15] blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-[0.15] blur-[100px]" />

        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept=".pdf,.txt"
        />
        <label 
          htmlFor="file-upload" 
          className="relative z-10 block w-full h-full cursor-pointer"
        >
          <div className="flex flex-col items-center gap-8 py-8">
            {/* Upload Icon with Glow Effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl transition-all duration-300 group-hover:blur-2xl" />
              <div className="relative p-6 bg-gradient-to-b from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/20 rounded-full ring-1 ring-blue-500/20 shadow-lg">
                <svg
                  className="w-16 h-16 text-blue-500 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
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
              </div>
            </div>

            {/* Text Content with Better Typography */}
            <div className="text-center space-y-4 max-w-sm mx-auto">
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
                Drop your paper here
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                or click to browse
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <svg className="w-4 h-4 mr-2 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Supported formats: PDF, TXT (max 10MB)
                </span>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Enhanced Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
              <svg
                className="w-5 h-5 text-red-500 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 