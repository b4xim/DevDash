import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const today = new Date().toISOString().split('T')[0];

    // Check existing focus
    if (!force) {
      const { data: existing } = await supabase
        .from('daily_focus')
        .select('*')
        .eq('focus_date', today)
        .single();
        
      if (existing) {
        return NextResponse.json({ focus: existing });
      }
    }

    // Gather stats
    const [labsResult, jobsResult, activityResult] = await Promise.all([
      supabase.from('labs').select('*'),
      supabase.from('job_applications').select('*'),
      supabase.from('activity_log').select('*').order('log_date', { ascending: false }).limit(7)
    ]);

    const labs = labsResult.data || [];
    const jobs = jobsResult.data || [];
    const activities = activityResult.data || [];

    // Calculate category completion %
    const CATEGORIES = ['linux', 'docker', 'kubernetes', 'aws', 'terraform', 'ci-cd', 'ansible'];
    const completion: Record<string, number> = {};
    const incompleteCategories: string[] = [];
    
    CATEGORIES.forEach(cat => {
      const catLabs = labs.filter(l => l.category === cat);
      const done = catLabs.filter(l => l.status === 'done').length;
      const total = catLabs.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      completion[cat] = pct;
      if (pct < 100) incompleteCategories.push(cat);
    });

    // Determine stall (no activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const hasRecentActivity = activities.some(a => new Date(a.log_date) >= sevenDaysAgo);
    
    const stalledInfo = !hasRecentActivity && incompleteCategories.length > 0 
      ? `Global stall detected: No activity in the last 7 days. Incomplete categories: ${incompleteCategories.join(', ')}.` 
      : 'No global stall.';

    // Calculate job counts
    const jobCounts: Record<string, number> = {};
    jobs.forEach(j => {
      jobCounts[j.status] = (jobCounts[j.status] || 0) + 1;
    });

    const summary = `
      Category Completion %: ${JSON.stringify(completion)}
      Stall Status: ${stalledInfo}
      Job Applications Status Counts: ${JSON.stringify(jobCounts)}
    `;

    const prompt = `Here's my DevOps learning progress: ${summary}. In 3-4 lines, tell me the single most important thing to focus on today and why — be specific, not generic.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro' }); // Using gemini-3.1-pro for high reasoning

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text().trim();

    // Store in daily_focus
    const { data: inserted, error } = await supabase
      .from('daily_focus')
      .upsert({ focus_date: today, suggestion }, { onConflict: 'focus_date' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ focus: inserted });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
