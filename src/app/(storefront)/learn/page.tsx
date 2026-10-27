import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getPreviewCourse } from '@/services/courses/get-preview-course';

export const revalidate = 3600;

/** The free preview lives at its own lesson URL; this route just points there. */
const LearnPage = async () => {
  const preview = await getPreviewCourse();

  if (preview) redirect(`/learn/${preview.course.slug}/${preview.lesson.id}`);

  const t = await getTranslations('Learn');

  return (
    <>
      <main>
        <Container>
          <p className="text-muted-foreground py-16 text-center text-sm">{t('noPreview')}</p>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default LearnPage;
