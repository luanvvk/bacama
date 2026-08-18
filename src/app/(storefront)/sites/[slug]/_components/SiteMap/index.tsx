import { Text } from '@/components/ui/Typography';

export interface SiteMapProps {
  /** Street address only — an editorial aside would break the geocode. */
  address: string;
  name: string;
}

const mapQuery = (address: string) => encodeURIComponent(address);

export const SiteMap = ({ address, name }: SiteMapProps) => (
  <div>
    <div className="bg-muted aspect-video overflow-hidden rounded-lg border">
      <iframe
        title={`Map of ${name}`}
        src={`https://www.google.com/maps?q=${mapQuery(address)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
    <Text variant="muted" className="mt-2">
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery(address)}`}
        target="_blank"
        rel="noreferrer"
        className="text-primary font-medium hover:underline"
      >
        Open in Google Maps →
      </a>
    </Text>
  </div>
);
