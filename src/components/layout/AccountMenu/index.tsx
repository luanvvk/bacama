import Link from 'next/link';
import { Show, useClerk, useUser } from '@clerk/nextjs';
import { GraduationCap, LogIn, LogOut, Package, ShieldCheck, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

export const AccountMenu = () => {
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const accountName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Account';

  if (!isLoaded) {
    return (
      <div className="bg-muted h-7 w-24 animate-pulse rounded-md" aria-label="Loading account" />
    );
  }

  return (
    <>
      <Show when="signed-out">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>
      <Show when="signed-in">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="max-w-40 truncate">
              {accountName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <p className="font-heading text-foreground truncate text-sm">{accountName}</p>
              <p className="text-muted-foreground text-xs">Your Bacama account</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account/profile">
                <UserRound /> My profile
              </Link>
            </DropdownMenuItem>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut({ redirectUrl: '/' })}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>
    </>
  );
};
