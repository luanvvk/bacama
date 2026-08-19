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
  const preview = await getPreviewCourse();

  return (
    <>
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/courses">Workshops</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{preview?.course.name ?? 'Preview'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {preview ? (
            <LessonPreview preview={preview} />
          ) : (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No free preview is available right now.
            </p>
          )}
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default LearnPage;
