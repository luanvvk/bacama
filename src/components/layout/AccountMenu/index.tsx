import Link from 'next/link';
import { GraduationCap, LogIn, Package, ShieldCheck, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

export const AccountMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        Log in
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuLabel>
        <p className="font-heading text-foreground text-sm">Welcome</p>
        <p className="text-muted-foreground text-xs">Not signed in</p>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/login">
          <LogIn /> Sign in / Create account
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/me">
          <GraduationCap /> My learning
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/account">
          <Package /> My orders
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Staff access</DropdownMenuLabel>
      <DropdownMenuItem asChild>
        <Link href="/teach">
          <UserRound /> Teacher console
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/admin">
          <ShieldCheck /> Admin console
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
