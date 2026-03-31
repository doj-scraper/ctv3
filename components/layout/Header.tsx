import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { Activity, ChevronRight } from 'lucide-react';

import { prisma } from '@/lib/prisma';

import { HeaderActions } from './HeaderActions';

export async function Header() {
  const { userId: clerkId } = await auth();
  let cartItemCount = 0;

  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (user) {
      const cartSummary = await prisma.cartItem.aggregate({
        where: { userId: user.id },
        _sum: { quantity: true },
      });

      cartItemCount = cartSummary._sum.quantity ?? 0;
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-ct-text-secondary/10 bg-[rgba(7,10,18,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/home" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ct-accent/20 bg-ct-accent/10 text-sm font-bold italic text-ct-accent transition-[border-color,background-color,color] group-hover:border-ct-accent/40 group-hover:bg-ct-accent group-hover:text-ct-bg">
              CT
            </div>
            <div className="min-w-0">
              <div className="heading-display text-lg tracking-[0.04em] text-ct-text sm:text-xl">
                CELL<span className="text-ct-accent">TECH</span>
              </div>
              <div className="hidden text-[11px] uppercase tracking-[0.18em] text-ct-text-secondary sm:block">
                Wholesale Inventory Rail
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 xl:flex">
            <NavLink href="/home">Home</NavLink>
            <NavLink href="/catalog">Catalog</NavLink>
            <NavLink href="/features">Capabilities</NavLink>
            <NavLink href="/orders">Orders</NavLink>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-ct-text-secondary/10 bg-ct-bg-secondary/55 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ct-text-secondary">
            <Activity className="h-3.5 w-3.5 text-ct-accent" />
            Live Stock Sync
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 rounded-full border border-ct-text-secondary/10 bg-ct-bg-secondary/35 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ct-text-secondary transition-colors hover:text-ct-accent"
          >
            Enter Catalog
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <HeaderActions cartItemCount={cartItemCount} />
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-ct-text-secondary transition-[border-color,color,background-color] hover:border-ct-text-secondary/10 hover:bg-ct-bg-secondary/45 hover:text-ct-text"
    >
      {children}
    </Link>
  );
}
