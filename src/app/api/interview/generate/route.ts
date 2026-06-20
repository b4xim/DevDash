export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const { category, doneLabs } = await request.json();

  if (!category) {
    return NextResponse.json({ error: 'category is required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const doneStr = doneLabs?.length ? doneLabs.join(', ') : 'None yet';

  const prompt = `You are a strict technical interviewer for a DevOps Engineering role.
The candidate claims knowledge in: ${category}.
They have completed these hands-on labs: ${doneStr}.

Generate 3 technical interview questions to test their practical knowledge in ${category}.
The questions should range from basic to advanced. 
Output ONLY a JSON array of strings, where each string is a question.
Do NOT output any markdown blocks like \`\`\`json. Just the raw JSON array.

Example:
["What is the difference between a Pod and a Deployment?", "How do you securely pass secrets to a container?", "Explain how a LoadBalancer service works in AWS."]`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up if Gemini added markdown formatting anyway
    text = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    
    const questions = JSON.parse(text);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
