import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { toAppLocale } from '@/lib/localize';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getPreviewCourse } from '@/services/courses/get-preview-course';

/** The free preview lives at its own lesson URL; this route just points there. */
const LearnPage = async () => {
  const locale = toAppLocale(await getLocale());
  const preview = await getPreviewCourse(locale);

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
