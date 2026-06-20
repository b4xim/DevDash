export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const { labs } = await request.json();

  if (!labs || !Array.isArray(labs)) {
    return NextResponse.json({ error: 'labs array is required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const doneLabs = labs.filter(l => l.status === 'done').map(l => l.name);
  const inProgressLabs = labs.filter(l => l.status === 'in_progress').map(l => l.name);

  const doneStr = doneLabs.length ? doneLabs.join(', ') : 'None recently';
  const inProgressStr = inProgressLabs.length ? inProgressLabs.join(', ') : 'None currently';

  const prompt = `You are an AI generating a daily Agile standup update for a DevOps engineer.
Here is their current learning progress:
- Recently completed: ${doneStr}
- Currently in progress: ${inProgressStr}

Write a professional, 3-bullet daily standup update (Yesterday, Today, Blockers). 
Keep it realistic and concise, as if posting it in a Slack channel.
No Markdown headers or bold text, just the raw text format.

Example:
Yesterday: I finished the labs on Docker Compose multi-service deployments.
Today: I'll be focusing on building my first GitHub Actions workflow.
Blockers: None so far.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ standup: text.trim() });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to generate standup' }, { status: 500 });
  }
}
