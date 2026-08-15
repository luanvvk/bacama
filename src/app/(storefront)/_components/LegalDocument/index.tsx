import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Text } from '@/components/ui/Typography';

const sectionId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const LegalDocument = ({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}) => (
  <StaticPageShell eyebrow={eyebrow} title={title} description={description}>
    <div className="grid gap-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-16">
      <aside className="h-fit border-b pb-5 lg:sticky lg:top-24 lg:border-b-0 lg:border-l lg:pb-0 lg:pl-5">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          On this page
        </p>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
          {sections.map((section) => (
            <a
              key={section.title}
              href={`#${sectionId(section.title)}`}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {section.title}
            </a>
          ))}
        </nav>
        <p className="text-muted-foreground mt-6 font-mono text-xs uppercase">
          Updated · {updated}
        </p>
      </aside>
      <article className="space-y-12">
        {sections.map((section) => (
          <section key={section.title} id={sectionId(section.title)} className="scroll-mt-24">
            <h2 className="font-heading text-2xl sm:text-3xl">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} className="text-muted-foreground mt-4">
                {paragraph}
              </Text>
            ))}
          </section>
        ))}
      </article>
    </div>
  </StaticPageShell>
);
