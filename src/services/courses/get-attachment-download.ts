import { prisma } from '@/lib/prisma';
import { getLearnerEnrollment } from '@/services/enrollments/get-learner-enrollment';

export type AttachmentDownload =
  | { status: 'ok'; url: string }
  | { status: 'not_found' }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' };

/** Server-only on purpose: `Attachment.url` is the paid file, so it is kept off
 * the outline types and handed out only after the lesson's access check passes
 * (free preview, or an active enrolment in the course). */
export const getAttachmentDownload = async (
  attachmentId: string,
  userId: string | null,
): Promise<AttachmentDownload> => {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: {
      url: true,
      lesson: { select: { isFreePreview: true, module: { select: { courseId: true } } } },
    },
  });

  if (!attachment) return { status: 'not_found' };
  if (attachment.lesson.isFreePreview) return { status: 'ok', url: attachment.url };
  if (!userId) return { status: 'unauthenticated' };

  const enrollment = await getLearnerEnrollment(userId, attachment.lesson.module.courseId);

  return enrollment ? { status: 'ok', url: attachment.url } : { status: 'forbidden' };
};
