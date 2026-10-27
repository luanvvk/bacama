import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';

import { toAppLocale } from '@/lib/localize';

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

const Home = async () => {
  const t = await getTranslations('Announcements');
  // Real announcements join the evergreen taglines, so a dated line ("Site 3
  // opens in September") can no longer outlive its own start/end window.
  const locale = toAppLocale(await getLocale());
  const announcements = await getActiveAnnouncements(locale);
  const taglines = t.raw('home') as string[];

  return (
    <>
      <Suspense fallback={null}>
        <EntranceOverlay />
      </Suspense>
      <AnnouncementBar items={[...taglines, ...announcements.map(({ title }) => title)]} />
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
