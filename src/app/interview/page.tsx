'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Lab } from '@/lib/supabase';

const CATEGORIES = ['linux', 'docker', 'kubernetes', 'aws', 'terraform', 'ci-cd', 'ansible'];

export default function InterviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');

  // Fetch questions
  const generateQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    setAnswers([]);
    setFeedback('');

    try {
      // First get completed labs for context
      const labsRes = await fetch(`/api/labs?category=${selectedCategory}`);
      const labs: Lab[] = await labsRes.json();
      const doneLabs = labs.filter(l => l.status === 'done').map(l => l.name);

      const res = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, doneLabs }),
      });
      const data = await res.json();
      if (res.ok && data.questions) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(''));
      } else {
        alert(data.error || 'Failed to generate questions');
      }
    } catch (err) {
      alert('Error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  // Submit answers for grading
  const submitAnswers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interview/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, questions, answers }),
      });
      const data = await res.json();
      if (res.ok && data.feedback) {
        setFeedback(data.feedback);
      } else {
        alert(data.error || 'Failed to grade answers');
      }
    } catch (err) {
      alert('Error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">AI Mock Interview</h1>
        <p className="page-subtitle">Test your knowledge with dynamic technical questions based on your completed labs.</p>
      </div>

      {!questions.length && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Select a topic to begin</h2>
          <select 
            className="input" 
            style={{ maxWidth: '300px', margin: '0 auto 20px', display: 'block' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={generateQuestions}>
            Generate Interview Questions
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner" style={{ width: '30px', height: '30px', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Thinking...</p>
        </div>
      )}

      {questions.length > 0 && !feedback && !loading && (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--info)' }}>
            Topic: {selectedCategory.toUpperCase()}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {questions.map((q, i) => (
              <div key={i}>
                <label className="label" style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {i + 1}. {q}
                </label>
                <textarea
                  className="input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Type your answer here..."
                  value={answers[i]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[i] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setQuestions([])}>Cancel</button>
            <button className="btn btn-primary" onClick={submitAnswers}>Submit for Grading</button>
          </div>
        </div>
      )}

      {feedback && !loading && (
        <div className="card markdown-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--success)' }}>Interview Feedback</h2>
            <button className="btn btn-ghost" onClick={() => { setQuestions([]); setFeedback(''); }}>Start Over</button>
          </div>
          <ReactMarkdown>{feedback}</ReactMarkdown>
        </div>
      )}
      
      <style>{`
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 1.5em; margin-bottom: 0.5em; color: var(--text-primary); }
        .markdown-content p { margin-bottom: 1em; color: var(--text-secondary); }
        .markdown-content pre { background: var(--bg-elevated); padding: 12px; border-radius: 6px; overflow-x: auto; margin-bottom: 1em; border: 1px solid var(--border); }
        .markdown-content code { background: var(--bg-elevated); padding: 2px 4px; border-radius: 4px; font-size: 0.85em; color: var(--accent); }
        .markdown-content pre code { background: transparent; padding: 0; color: inherit; }
        .markdown-content ul, .markdown-content ol { padding-left: 20px; margin-bottom: 1em; color: var(--text-secondary); }
        .markdown-content li { margin-bottom: 0.25em; }
        .markdown-content strong { color: var(--text-primary); }
      `}</style>
    </div>
  );
}
