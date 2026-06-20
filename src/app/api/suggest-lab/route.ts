export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const { category, existingLabs } = await request.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const existing = existingLabs?.length
    ? `Already tracked labs: ${existingLabs.join(', ')}.`
    : 'No labs tracked yet.';

  const prompt = `You are helping someone learn ${category} for a DevOps engineering career.
${existing}

Suggest ONE specific, practical hands-on lab exercise that is NOT already in the list above.
The lab should be a concrete task someone can actually do, not a broad topic.

Respond with ONLY the lab name as a short phrase (5-10 words max). No explanations, no bullet points, no quotes, no numbering. Just the lab name itself.

Example format:
Deploy a containerised Node app with Docker Compose`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const labName = result.response.text().trim().replace(/^["'\-\d\.\s]+|["'\s]+$/g, '');
    return NextResponse.json({ labName });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to get AI suggestion' }, { status: 500 });
  }
}
