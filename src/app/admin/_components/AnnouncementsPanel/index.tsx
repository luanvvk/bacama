'use client';

import { ADMIN_ANNOUNCEMENTS } from '@/constants/admin';
import { toast } from '@/lib/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const AnnouncementsPanel = () => (
  <Card>
    <CardHeader className="flex items-center justify-between">
      <CardTitle>Announcements</CardTitle>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => toast("New announcements aren't wired up yet.")}
      >
        + New
      </Button>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      {ADMIN_ANNOUNCEMENTS.map((announcement) => (
        <div key={announcement.title} className="border-b pb-4 last:border-0 last:pb-0">
          <p className="text-sm font-semibold">{announcement.title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{announcement.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={announcement.status === 'Live' ? 'success' : 'info'}>
              {announcement.status}
            </Badge>
            <span className="text-muted-foreground font-mono text-xs">{announcement.meta}</span>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);
