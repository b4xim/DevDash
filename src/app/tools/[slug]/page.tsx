import ToolPageClient from './ToolPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  return <ToolPageClient slug={slug} />;
}
