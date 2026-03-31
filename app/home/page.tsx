// app/home/page.tsx - Internal dashboard/home
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Command,
  Cpu,
  Database,
  Layers,
  Search,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => {
      setIsReady(true);
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;

        if (target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden px-4 sm:px-6 lg:px-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-24 top-[14%] h-[34rem] w-[34rem] rounded-full bg-ct-accent/7 blur-[150px]" />
        <div className="absolute -left-12 bottom-[12%] h-[20rem] w-[20rem] rounded-full bg-ct-accent/8 blur-[120px]" />
        <div className="absolute right-[-10rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-blue-500/5 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,192,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,192,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-ct-accent/20 to-transparent" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-ct-accent/10 to-transparent" />

        <FloatingElement className="left-[8%] top-[18%]" delay={0}>
          <Cpu className="h-8 w-8 text-ct-accent/35" />
        </FloatingElement>
        <FloatingElement className="left-[16%] top-[58%]" delay={1}>
          <Layers className="h-10 w-10 text-ct-accent/20" />
        </FloatingElement>
        <FloatingElement className="left-[20%] top-[32%]" delay={1.6}>
          <div className="h-14 w-14 rounded-2xl border border-ct-accent/15 bg-ct-accent/5" />
        </FloatingElement>
        <FloatingElement className="right-[14%] top-[24%]" delay={0.6}>
          <Zap className="h-5 w-5 text-ct-accent/18" />
        </FloatingElement>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 py-6 sm:py-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
        <div
          className={`hidden lg:block transition-[opacity,transform] duration-700 ease-out ${
            isReady ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}
        >
          <div className="max-w-sm rounded-[1.9rem] border border-ct-accent/15 bg-[linear-gradient(180deg,rgba(17,23,37,0.72),rgba(7,10,18,0.88))] p-6 shadow-[0_28px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div className="text-micro text-ct-accent">Signal Layer</div>
              <div className="h-px flex-1 bg-gradient-to-r from-ct-accent/30 to-transparent" />
            </div>
            <div className="mt-5 space-y-4">
              <SignalRow label="Inventory Feed" value="Live" accent />
              <SignalRow label="Fulfillment" value="Next-Day" />
              <SignalRow label="Quality Trace" value="Verified OEM" />
            </div>
            <div className="mt-8 rounded-[1.35rem] border border-ct-text-secondary/10 bg-ct-bg/60 p-4">
              <div className="text-micro text-ct-text-secondary">Search Entry</div>
              <p className="mt-3 text-sm leading-6 text-ct-text-secondary">
                Built as a direct catalog entry point, not a scrolling marketing page.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <RailTag label="SKU-led" />
                <RailTag label="Apple" />
                <RailTag label="Samsung" />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mx-auto w-full max-w-3xl text-center transition-[opacity,transform] duration-700 ease-out lg:text-left ${
            isReady ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`}
        >
          <HeroBadge>Search-First Wholesale Entry</HeroBadge>

          <div className="mt-4 space-y-4 sm:mt-5">
            <div className="text-micro text-ct-text-secondary">CellTech Inventory Rail</div>
            <h1 className="heading-display text-4xl leading-[0.9] text-ct-text sm:text-5xl lg:text-[4.7rem]">
              WHOLESALE MOBILE <span className="text-ct-accent">COMPONENTS</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-ct-text-secondary sm:text-base lg:mx-0 lg:text-lg">
              Enterprise-grade mobile parts for service centers that need live stock visibility, verified
              quality, and a faster path to allocation.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-2xl lg:mx-0 lg:mt-8">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 rounded-[1.75rem] bg-ct-accent/20 blur-xl opacity-0 transition-opacity group-focus-within:opacity-100" />

              <div className="relative flex items-center overflow-hidden rounded-[1.75rem] border border-ct-text-secondary/20 bg-ct-bg-secondary/80 focus-within:border-ct-accent/50 focus-within:shadow-[0_0_30px_rgba(0,229,192,0.15)] transition-all">
                <div className="pl-5 text-ct-text-secondary">
                  <Search className="h-5 w-5" />
                </div>

                <input
                  ref={searchInputRef}
                  type="search"
                  inputMode="search"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Search by SKU, model, or part type..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="flex-1 bg-transparent px-3 py-4 text-base text-ct-text placeholder:text-ct-text-secondary/40 focus:outline-none sm:py-5 sm:text-lg"
                />

                <div className="pr-2">
                  <kbd className="hidden items-center gap-1 rounded-lg border border-ct-text-secondary/10 bg-ct-bg px-2 py-1 text-xs font-mono text-ct-text-secondary sm:inline-flex">
                    <Command className="h-3 w-3" /> /
                  </kbd>
                </div>

                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ct-accent text-ct-bg transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-auto sm:px-5"
                  aria-label="Search catalog"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>

            <p className="mt-3 text-xs leading-5 text-ct-text-secondary/60">
              Try: &quot;iPhone 15 Pro Battery&quot;, &quot;Galaxy S24 Screen&quot;, or SKU
              &quot; AI-IP15PR-1A-OR&quot;
            </p>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-ct-text-secondary/10 bg-ct-bg-secondary/28 p-4 sm:mt-8 sm:p-5">
            <div className="lg:hidden">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                <MobileSignalPill label="Inventory" value="Live" />
                <MobileSignalPill label="Fulfillment" value="Next-Day" />
                <MobileSignalPill label="Quality" value="Verified OEM" accent />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
              <div className="-mx-1 flex items-center gap-3 overflow-x-auto px-1 text-xs uppercase tracking-[0.18em] text-ct-text-secondary sm:gap-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
                <Link href="/catalog" className="transition-colors hover:text-ct-accent">
                  Browse Catalog
                </Link>
                <span className="text-ct-text-secondary/30">/</span>
                <Link href="/features" className="transition-colors hover:text-ct-accent">
                  Platform Detail
                </Link>
                <span className="text-ct-text-secondary/30">/</span>
                <Link href="/catalog?brand=Apple" className="transition-colors hover:text-ct-accent">
                  Apple
                </Link>
                <span className="text-ct-text-secondary/30">/</span>
                <Link href="/catalog?brand=Samsung" className="transition-colors hover:text-ct-accent">
                  Samsung
                </Link>
              </div>

              <div className="-mx-1 flex items-center gap-3 overflow-x-auto px-1 text-xs text-ct-text-secondary/70 sm:gap-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:overflow-visible lg:px-0">
                <TrustPill icon={ShieldCheck} label="Verified OEM" />
                <TrustPill icon={Database} label="Real-time Stock" />
                <TrustPill icon={Truck} label="Next-day Shipping" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingElement({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        animation: 'float 6s ease-in-out infinite',
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function HeroBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-ct-accent/20 bg-ct-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ct-accent">
      {children}
    </span>
  );
}

function SignalRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ct-text-secondary/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-micro text-ct-text-secondary">{label}</span>
      <span className={`text-sm font-semibold ${accent ? 'text-ct-accent' : 'text-ct-text'}`}>{value}</span>
    </div>
  );
}

function TrustPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-ct-text-secondary/10 bg-ct-bg-secondary/35 px-3 py-2">
      <Icon className="h-4 w-4 text-ct-accent/80" />
      <span>{label}</span>
    </span>
  );
}

function RailTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-ct-text-secondary/10 bg-ct-bg-secondary/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ct-text-secondary">
      {label}
    </span>
  );
}

function MobileSignalPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-[9.5rem] rounded-full border border-ct-text-secondary/10 bg-ct-bg/55 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-ct-text-secondary">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${accent ? 'text-ct-accent' : 'text-ct-text'}`}>{value}</div>
    </div>
  );
}
