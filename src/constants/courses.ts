export type CourseFormat = 'online' | 'in-person' | 'hybrid';

export interface CourseLesson {
  number: string;
  title: string;
  duration: string;
  completed?: boolean;
  current?: boolean;
}

export interface CourseModule {
  title: string;
  lessons: CourseLesson[];
}

export interface CourseDocument {
  name: string;
  size: string;
}

export interface CoursePreview {
  moduleLabel: string;
  title: string;
  overview: string[];
  documents: CourseDocument[];
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  format: CourseFormat;
  meta: string;
  description: string;
  imageUrl: string;
  priceVnd: number;
  availability: string;
  lowAvailability?: boolean;
  ctaLabel: string;
  modules?: CourseModule[];
  preview?: CoursePreview;
}

export const COURSES: Course[] = [
  {
    id: 'latte-art',
    slug: 'latte-art',
    name: 'Latte Art',
    format: 'online',
    meta: '9 lessons',
    description:
      'Video lessons with live discussion, a photo-based exam. Learn at home, finish at a café.',
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=620&q=72',
    priceVnd: 790000,
    availability: 'Lesson 1 free',
    ctaLabel: 'Enrol',
    modules: [
      {
        title: 'Module 1 · Foundations',
        lessons: [
          { number: '01', title: 'Milk and microfoam', duration: '12:40', completed: true },
          { number: '02', title: 'The basic pour', duration: '09:18', completed: true },
          { number: '03', title: 'The heart', duration: '11:05', current: true },
          { number: '04', title: 'Rosetta', duration: '14:22' },
        ],
      },
      {
        title: 'Module 2 · Advanced figures',
        lessons: [
          { number: '05', title: 'Tulip', duration: '10:51' },
          { number: '06', title: 'The swan', duration: '16:03' },
          { number: '07', title: 'Fixing common faults', duration: '12:30' },
        ],
      },
      {
        title: 'Module 3 · Final',
        lessons: [
          { number: '08', title: 'Preparing your submission', duration: '08:44' },
          { number: '09', title: 'Submit & get certified', duration: 'Assignment' },
        ],
      },
    ],
    preview: {
      moduleLabel: 'Module 1 · Lesson 03',
      title: 'The heart — pour slow, finish clean',
      overview: [
        'The heart comes first because it teaches three things at once: pour height, flow speed, and when to cut through. A lopsided heart is nearly always a jug lowered too late. Watch from 4:10 to see the two pours side by side.',
        "This week's practice: pour twenty cups, photograph your best three, and post them in the discussion. Anh Minh comments on every submission within 24 hours.",
      ],
      documents: [
        { name: 'Milk ratio & temperature chart', size: 'PDF · 240 KB' },
        { name: 'Twenty-cup practice checklist', size: 'PDF · 88 KB' },
        { name: 'Reference photos — good vs lopsided', size: 'JPG · 1.2 MB' },
      ],
    },
  },
  {
    id: 'viennoiserie',
    slug: 'viennoiserie',
    name: 'Viennoiserie',
    format: 'in-person',
    meta: 'Hội An · weekend',
    description:
      "Two days in Hội An's old town, eight people, French butter. Hand-laminated, cold-proofed, baked.",
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=620&q=72',
    priceVnd: 3200000,
    availability: '3 seats left · 21–22 Sep',
    lowAvailability: true,
    ctaLabel: 'Book a seat',
  },
  {
    id: 'cupping-origin',
    slug: 'cupping-origin',
    name: 'Cupping & Origin',
    format: 'online',
    meta: 'sensory',
    description: 'Sơn La and Đà Lạt origins; a sensory-based final. Start whenever.',
    imageUrl:
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=620&q=72',
    priceVnd: 1290000,
    availability: 'Start any time',
    ctaLabel: 'Enrol',
  },
  {
    id: 'barista-foundations',
    slug: 'barista-foundations',
    name: 'Barista Foundations',
    format: 'hybrid',
    meta: '6 weeks online + final at a café',
    description:
      '24 online lessons; final exam on-site in Hội An. A foundation course for staff and shop owners.',
    imageUrl:
      'https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=620&q=72',
    priceVnd: 1890000,
    availability: '1 seat left · starts 1 Oct',
    lowAvailability: true,
    ctaLabel: 'Enrol',
  },
];

export const getCourseBySlug = (slug: string) => COURSES.find((course) => course.slug === slug);
