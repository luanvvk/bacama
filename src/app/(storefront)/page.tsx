import { Suspense } from 'react';

import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { getActiveAnnouncements } from '@/services/sites/get-active-announcements';

import { CafesSection } from './_components/CafesSection';
import { CtaBandSection } from './_components/CtaBandSection';
import { EntranceOverlay } from './_components/EntranceOverlay';
import { HeroSection } from './_components/HeroSection';
import { StorySection } from './_components/StorySection';
import { TodaysStockSection } from './_components/TodaysStockSection';
import { WorkshopsSection } from './_components/WorkshopsSection';

// Stock, roast freshness and active announcements all change during the day, so
// this route must not be frozen at build time (docs/BUILD-PLAN.md task 1.10).
export const revalidate = 3600;

const TAGLINES = [
  'Roasted in-house, every batch',
  'Fresh bake, every morning',
  'Nationwide in 2–3 days',
];

const Home = async () => {
  // Real announcements join the evergreen taglines, so a dated line ("Site 3
  // opens in September") can no longer outlive its own start/end window.
  const announcements = await getActiveAnnouncements();

  return (
    <>
      <Suspense fallback={null}>
        <EntranceOverlay />
      </Suspense>
      <AnnouncementBar items={[...TAGLINES, ...announcements.map(({ title }) => title)]} />
      <main>
        <HeroSection />
        <TodaysStockSection />
        <StorySection />
        <WorkshopsSection />
        <CafesSection />
        <CtaBandSection />
      </main>
      <Footer />
    </>
  );
};

export default Home;
