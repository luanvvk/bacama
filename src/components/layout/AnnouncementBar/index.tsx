import { Fragment } from 'react';

import { Container } from '@/components/layout/Container';

export interface AnnouncementBarProps {
  items: string[];
}

export const AnnouncementBar = ({ items }: AnnouncementBarProps) => (
  <div className="bg-foreground text-background">
    <Container className="flex flex-wrap items-center gap-2 py-2 font-mono text-xs tracking-wide">
      {items.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && <span aria-hidden="true">·</span>}
          <span>{item}</span>
        </Fragment>
      ))}
    </Container>
  </div>
);
