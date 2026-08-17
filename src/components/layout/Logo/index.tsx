import Link from 'next/link';

export const Logo = () => (
  <Link href="/" className="flex flex-col leading-none">
    <span className="font-heading text-lg">
      Bacama<span className="text-primary">·</span>
    </span>
    <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
      Coffee and more
    </span>
  </Link>
);
