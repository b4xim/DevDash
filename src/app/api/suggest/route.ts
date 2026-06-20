import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const { tool, completed, pending } = await request.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const completedStr = completed?.length ? completed.join(', ') : 'none yet';
  const pendingStr = pending?.length ? pending.join(', ') : 'none';

  const prompt = `I'm learning ${tool} for a DevOps job. Completed: ${completedStr}. Pending: ${pendingStr}. In 2-3 short lines, suggest what to focus on next and why.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ suggestion: text });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to get AI suggestion' }, { status: 500 });
  }
}
