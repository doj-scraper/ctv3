'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';

import { CartDrawer } from '@/components/cart/CartDrawer';

import { Button } from '../ui/Button';

type HeaderActionsProps = {
  cartItemCount: number;
};

export function HeaderActions({ cartItemCount }: HeaderActionsProps) {
  const { isSignedIn } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm" className="rounded-full border border-ct-text-secondary/10 px-4">
              Log In
            </Button>
          </SignInButton>
        ) : null}

        {!isSignedIn ? (
          <SignUpButton mode="modal">
            <Button size="sm" className="rounded-full px-4 uppercase tracking-[0.12em]">
              Create Account
            </Button>
          </SignUpButton>
        ) : null}

        {isSignedIn ? (
          <Link
            href="/orders"
            className="hidden rounded-full border border-ct-text-secondary/10 px-4 py-2 text-sm font-medium text-ct-text-secondary transition-[border-color,color,background-color] hover:border-ct-text-secondary/20 hover:bg-ct-bg-secondary/45 hover:text-ct-text md:block"
          >
            Orders
          </Link>
        ) : null}

        {isSignedIn ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="relative h-10 w-10 rounded-full border border-ct-text-secondary/10 px-0"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5 text-ct-text" />
            {cartItemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-ct-bg bg-ct-accent px-1 text-[10px] font-bold text-ct-bg">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            ) : null}
          </Button>
        ) : null}

        {isSignedIn ? <UserButton /> : null}
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
