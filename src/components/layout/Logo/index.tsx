import Image from 'next/image';
import Link from 'next/link';

export const Logo = () => (
  <Link href="/" className="inline-flex items-center">
    <Image
      src="/Images/bacama-logo-crop.png"
      alt="Bacama — Coffee & More"
      width={1422}
      height={892}
      className="h-10 w-auto"
    />
  </Link>
);
