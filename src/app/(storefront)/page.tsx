import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';

import { CafesSection } from './_components/CafesSection';
import { CtaBandSection } from './_components/CtaBandSection';
import { HeroSection } from './_components/HeroSection';
import { StorySection } from './_components/StorySection';
import { TodaysStockSection } from './_components/TodaysStockSection';
import { WorkshopsSection } from './_components/WorkshopsSection';

const ANNOUNCEMENTS = [
  "Today's roast · Đà Lạt Washed",
  'Fresh bake · 05:14',
  'Nationwide in 2–3 days',
  'Site 3 opens in September',
];

const Home = () => (
  <>
    <AnnouncementBar items={ANNOUNCEMENTS} />
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

export default Home;
