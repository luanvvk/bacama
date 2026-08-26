import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getPreviewCourse } from '@/services/courses/get-preview-course';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

import { LessonPreview } from './_components/LessonPreview';

export const revalidate = 3600;

const LearnPage = async () => {
  const [t, preview] = await Promise.all([getTranslations('Learn'), getPreviewCourse()]);

  return (
    <>
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('breadcrumbHome')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/courses">{t('breadcrumbWorkshops')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{preview?.course.name ?? t('breadcrumbFallback')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {preview ? (
            <LessonPreview preview={preview} />
          ) : (
            <p className="text-muted-foreground py-16 text-center text-sm">{t('noPreview')}</p>
          )}
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default LearnPage;
