import { NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';

export const runtime = 'edge';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONTENT_LENGTH = 8000; // Gemini's token limit

function cleanJsonResponse(text: string): string {
  // First, find the first occurrence of '{'
  const startIndex = text.indexOf('{');
  if (startIndex === -1) {
    throw new Error('No valid JSON structure found');
  }

  // Find the matching closing brace
  let braceCount = 0;
  let endIndex = -1;

  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === '{') braceCount++;
    if (text[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex === -1) {
    throw new Error('No valid JSON structure found');
  }

  // Extract the JSON portion
  const jsonText = text.slice(startIndex, endIndex + 1);

  try {
    // Validate by parsing
    JSON.parse(jsonText);
    return jsonText;
  } catch (e) {
    throw new Error('Invalid JSON structure');
  }
}

export async function POST(req: Request) {
  try {
    // Check content length header
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 413 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 413 }
      );
    }

    // Read file content in chunks if needed
    const text = await file.text();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No content found in file' }, { status: 400 });
    }

    // Take first part of content to avoid token limits
    const content = text.substring(0, MAX_CONTENT_LENGTH);

    const prompt = `
      You are creating a comprehensive study plan to help a high school graduate understand this research paper.
      Break down ALL important concepts and create a complete learning path.

      IMPORTANT: Keep your response focused and concise while covering all essential topics.
      Generate a study plan with 4-6 core sections that build progressively:

      1. Fundamental Prerequisites (math, programming, basic concepts needed)
      2. Core Concepts (main ideas and methodologies from the paper)
      3. Technical Implementation (how to actually implement the ideas)
      4. Advanced Topics & Applications (deeper understanding and practical use)

      JSON Structure:
      {
        "title": "Study Plan: ${file.name.replace(/\.[^/.]+$/, '')}",
        "sections": [
          {
            "topic": "Clear topic name",
            "timeRequired": "Estimated time",
            "description": "Clear, concise explanation",
            "prerequisites": ["Required knowledge"],
            "resources": [
              {
                "title": "Resource name",
                "url": "URL",
                "difficulty": "beginner/intermediate/advanced"
              }
            ],
            "exercises": [
              {
                "question": "Practice question",
                "type": "multiple-choice/open-ended/coding",
                "hint": "Helpful hint"
              }
            ]
          }
        ]
      }

      Focus on:
      1. Essential concepts only
      2. Clear progression of topics
      3. Practical understanding
      4. Key implementation details
      5. Actual paper content

      Paper to analyze:
      ${content}

      IMPORTANT: 
      - Keep the response focused and concise
      - Include only essential information
      - Ensure valid JSON format
      - Limit to 4-6 main sections
    `;

    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      try {
        const cleanedResponse = cleanJsonResponse(responseText);
        const studyPlan = JSON.parse(cleanedResponse);
        
        // Basic validation
        if (!studyPlan?.title || !Array.isArray(studyPlan?.sections)) {
          throw new Error('Invalid study plan structure');
        }

        // Ensure we have a reasonable number of sections
        if (studyPlan.sections.length < 2 || studyPlan.sections.length > 8) {
          throw new Error('Invalid number of sections');
        }

        return NextResponse.json(studyPlan);
      } catch (parseError: any) {
        console.error('Parse error:', parseError);
        return NextResponse.json({ 
          error: 'Failed to generate valid study plan'
        }, { status: 500 });
      }
    } catch (aiError: any) {
      console.error('AI error:', aiError);
      return NextResponse.json({ 
        error: 'Failed to process paper'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Server error occurred'
    }, { status: 500 });
  }
} 