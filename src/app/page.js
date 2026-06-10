import { getSite } from '@/lib/store';
import { isUnlocked } from '@/lib/auth';
import Editor from '@/components/Editor';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [site, unlocked] = await Promise.all([getSite(), isUnlocked()]);
  return <Editor initialSite={site} initialUnlocked={unlocked} />;
}
