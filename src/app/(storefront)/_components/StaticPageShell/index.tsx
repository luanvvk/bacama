import { Container } from '@/components/layout/Container';
import { Heading, Text } from '@/components/ui/Typography';

interface StaticPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export const StaticPageShell = ({
  eyebrow,
  title,
  description,
  children,
}: StaticPageShellProps) => (
  <main>
    <section className="border-b py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end lg:gap-16">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">{eyebrow}</p>
          <Heading as="h1" size="xl" className="mt-3 max-w-3xl text-4xl sm:text-5xl">
            {title}
          </Heading>
          <Text variant="lead" className="text-muted-foreground mt-5 max-w-2xl">
            {description}
          </Text>
        </div>
        <aside className="border-primary/40 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Bacama · Đà Nẵng
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Small batches, an early bake, and a real person behind the answer.
          </p>
        </aside>
      </Container>
    </section>
    <Container className="py-12 sm:py-16">{children}</Container>
  </main>
);
