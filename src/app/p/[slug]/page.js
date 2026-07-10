import { notFound } from 'next/navigation';
import { getSite, getPageBySlug } from '@/lib/store';
import { isUnlocked } from '@/lib/auth';
import Editor from '@/components/Editor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  return { title: page ? `${page.title} — lousupp wireframe` : 'lousupp wireframe' };
}

export default async function WireframePage({ params }) {
  const { slug } = await params;
  const [site, unlocked] = await Promise.all([getSite(), isUnlocked()]);
  const page = site.pages.find((p) => p.slug === slug);
  if (!page) notFound();
  return <Editor initialPage={page} pillars={site.pillars} initialUnlocked={unlocked} />;
}
