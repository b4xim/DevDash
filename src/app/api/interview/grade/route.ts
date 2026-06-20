export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const { category, questions, answers } = await request.json();

  if (!category || !questions || !answers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const qaPairs = questions.map((q: string, i: number) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || 'No answer provided'}`).join('\n\n');

  const prompt = `You are a Senior DevOps Engineer interviewing a candidate for a role focusing on ${category}.
You just asked them these questions and received these answers:

${qaPairs}

Provide constructive feedback for the candidate. For each question:
1. Mention if their answer is correct, partially correct, or incorrect.
2. Provide the ideal, complete answer.
3. Give an overall score out of 10.

Keep it professional, encouraging, but technically rigorous. Use Markdown formatting.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ feedback: text });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to grade answers' }, { status: 500 });
  }
}
