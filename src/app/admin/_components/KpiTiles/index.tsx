import { KPI_TILES } from '@/constants/admin';
import { cn } from '@/lib/utils';

export const KpiTiles = () => (
  <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {KPI_TILES.map((tile) => (
      <div key={tile.label} className="rounded-lg border p-4">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {tile.label}
        </p>
        <p className="font-heading mt-1.5 text-3xl font-semibold">{tile.value}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {tile.delta && (
            <b className={cn(tile.deltaDirection === 'up' ? 'text-success' : 'text-destructive')}>
              {tile.delta}{' '}
            </b>
          )}
          {tile.detail}
        </p>
      </div>
    ))}
  </div>
);
