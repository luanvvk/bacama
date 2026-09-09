import Link from 'next/link';
import { Show, useClerk, useUser } from '@clerk/nextjs';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ACCOUNT_MENU_ITEMS, STAFF_MENU_ITEMS } from '@/constants/account-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
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
  const t = useTranslations('AccountMenu');
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const accountName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Account';

  if (!isLoaded) {
    return (
      <div
        className="bg-muted h-7 w-24 animate-pulse rounded-md"
        aria-label={t('loadingAccount')}
      />
    );
  }

  return (
    <>
      <Show when="signed-out">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {t('signIn')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                <UserRound className="size-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col overflow-hidden">
                <span className="font-heading text-foreground text-sm">{t('welcome')}</span>
                <span className="text-muted-foreground text-xs">{t('notSignedIn')}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogIn /> {t('signInCta')}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>
      <Show when="signed-in">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="max-w-40 gap-2 pl-1.5">
              <Avatar size="sm">
                <AvatarImage src={user?.imageUrl} alt="" />
                <AvatarFallback>
                  <UserRound className="size-3.5" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{accountName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.imageUrl} alt="" />
                <AvatarFallback>
                  <UserRound className="size-4" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <span className="flex flex-col overflow-hidden">
                <span className="font-heading text-foreground truncate text-sm">{accountName}</span>
                <span className="text-muted-foreground truncate text-xs">{t('yourAccount')}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ACCOUNT_MENU_ITEMS.map(({ labelKey, icon: Icon, href }) => (
              <DropdownMenuItem key={href} asChild>
                <Link href={href}>
                  <Icon /> {t(labelKey)}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('staffAccess')}</DropdownMenuLabel>
            {STAFF_MENU_ITEMS.map(({ labelKey, icon: Icon, href }) => (
              <DropdownMenuItem key={href} asChild>
                <Link href={href}>
                  <Icon /> {t(labelKey)}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut({ redirectUrl: '/' })}>
              <LogOut /> {t('logOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>
    </>
  );
};
