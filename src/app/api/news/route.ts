import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  date: string;
}

const RSS_FEEDS = [
  { url: 'https://kubernetes.io/feed.xml', source: 'Kubernetes' },
  { url: 'https://aws.amazon.com/blogs/devops/feed/', source: 'AWS DevOps' },
  { url: 'https://www.hashicorp.com/blog/feed.xml', source: 'HashiCorp' },
];

async function fetchReddit(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://www.reddit.com/r/devops.json?limit=25', {
      headers: { 'User-Agent': 'DevDash/1.0 (+https://devdash.local)' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.children ?? [])
      .filter((c: { data: { stickied: boolean } }) => !c.data.stickied)
      .map((c: { data: { title: string; url: string; created_utc: number } }) => ({
        title: c.data.title,
        source: 'Reddit r/devops',
        link: c.data.url,
        date: new Date(c.data.created_utc * 1000).toISOString(),
      }));
  } catch {
    return [];
  }
}

async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?query=devops&tags=story&hitsPerPage=25',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.hits ?? [])
      .filter((h: { url?: string }) => h.url)
      .map((h: { title: string; url: string; created_at: string }) => ({
        title: h.title,
        source: 'Hacker News',
        link: h.url,
        date: h.created_at,
      }));
  } catch {
    return [];
  }
}

async function fetchRss(url: string, source: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items ?? []).slice(0, 10).map((item) => ({
      title: item.title || 'Untitled',
      source,
      link: item.link || '',
      date: item.pubDate || item.isoDate || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const [reddit, hn, ...rssResults] = await Promise.allSettled([
    fetchReddit(),
    fetchHackerNews(),
    ...RSS_FEEDS.map((f) => fetchRss(f.url, f.source)),
  ]);

  const all: NewsItem[] = [
    ...(reddit.status === 'fulfilled' ? reddit.value : []),
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...rssResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
  ];

  // Deduplicate by link
  const seen = new Set<string>();
  const deduped = all.filter((item) => {
    if (!item.link || seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });

  // Sort by date descending
  deduped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(deduped.slice(0, 60));
}
