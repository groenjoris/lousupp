import { getSite } from '@/lib/store';
import { isUnlocked } from '@/lib/auth';
import StartScreen from '@/components/StartScreen';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [site, unlocked] = await Promise.all([getSite(), isUnlocked()]);
  const pages = site.pages.map(({ id, slug, title, createdAt, updatedAt, chapters }) => ({
    id, slug, title, createdAt, updatedAt, chapterCount: chapters.length,
  }));
  return <StartScreen initialPages={pages} initialUnlocked={unlocked} />;
}
