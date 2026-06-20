export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const { category, labName } = await request.json();

  if (!category || !labName) {
    return NextResponse.json({ error: 'category and labName are required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const prompt = `You are a Senior DevOps Engineer mentoring a junior engineer.
They are trying to complete a lab in the category "${category}" called "${labName}".

Provide a brief, practical explanation and tutorial for this lab. 
Keep it concise and actionable. Include code snippets or commands where relevant.
Do NOT write an essay. Use Markdown formatting.
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ explanation: text });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to get explanation' }, { status: 500 });
  }
}
