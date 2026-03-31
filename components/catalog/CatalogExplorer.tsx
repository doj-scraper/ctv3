'use client';

import { forwardRef, startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CircleAlert, Package2, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

import { addToCart } from '@/app/actions/cart.actions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

type FacetOption = {
  value: string;
  label: string;
  count: number;
};

type PartRecord = {
  id: string;
  sku: string;
  name: string;
  searchIndex: string;
  supplier: string | null;
  stock: number;
  price: number;
  brand: string;
  model: string;
  bucket: string;
  primaryDeviceLabel: string;
  quality: {
    id: string;
    code: string;
    name: string;
  };
  partType: {
    id: string;
    code: string;
    name: string;
    bucket: {
      id: number;
      name: string;
    };
  };
  compatibilities: Array<{
    id: string;
    phone: {
      id: string;
      label: string;
    };
  }>;
};

type PartsResponse = {
  success: boolean;
  total: number;
  parts: PartRecord[];
  filters: {
    brands: FacetOption[];
    buckets: FacetOption[];
    qualities: FacetOption[];
    models: FacetOption[];
  };
  error?: string;
};

type NoticeState = {
  tone: 'success' | 'error';
  message: string;
};

const emptyFilters = {
  brands: [] as FacetOption[],
  buckets: [] as FacetOption[],
  qualities: [] as FacetOption[],
  models: [] as FacetOption[],
};

function qualityVariant(name: string) {
  if (name === 'Original') {
    return 'accent' as const;
  }

  if (name === 'Refurbished') {
    return 'outline' as const;
  }

  if (name === 'OEM') {
    return 'default' as const;
  }

  return 'default' as const;
}

export function CatalogExplorer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [parts, setParts] = useState<PartRecord[]>([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [brand, setBrand] = useState(searchParams.get('brand') ?? '');
  const [model, setModel] = useState(searchParams.get('model') ?? '');
  const [bucket, setBucket] = useState(searchParams.get('bucket') ?? '');
  const [quality, setQuality] = useState(searchParams.get('quality') ?? '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [activeCartPartId, setActiveCartPartId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  const deferredSearch = useDeferredValue(search);
  const totalBrandCount = filters.brands.reduce((sum, option) => sum + option.count, 0);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setBrand(searchParams.get('brand') ?? '');
    setModel(searchParams.get('model') ?? '');
    setBucket(searchParams.get('bucket') ?? '');
    setQuality(searchParams.get('quality') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set('search', search.trim());
    }

    if (brand) {
      params.set('brand', brand);
    }

    if (model) {
      params.set('model', model);
    }

    if (bucket) {
      params.set('bucket', bucket);
    }

    if (quality) {
      params.set('quality', quality);
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) {
      return;
    }

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [brand, bucket, model, pathname, quality, router, search, searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (deferredSearch.trim()) {
      params.set('search', deferredSearch.trim());
    }

    if (brand) {
      params.set('brand', brand);
    }

    if (model) {
      params.set('model', model);
    }

    if (bucket) {
      params.set('bucket', bucket);
    }

    if (quality) {
      params.set('quality', quality);
    }

    async function loadParts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/parts?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        const data = (await response.json()) as PartsResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load catalog');
        }

        startTransition(() => {
          setParts(data.parts);
          setFilters(data.filters);
        });
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load catalog');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadParts();

    return () => controller.abort();
  }, [brand, bucket, deferredSearch, model, quality, requestVersion]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;

        if (target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA' && target?.tagName !== 'SELECT') {
          event.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const activeFilterCount = [brand, model, bucket, quality].filter(Boolean).length + (search.trim() ? 1 : 0);

  function clearFilters() {
    setSearch('');
    setBrand('');
    setModel('');
    setBucket('');
    setQuality('');
  }

  async function handleAddToCart(partId: string) {
    const result = await addToCart(partId, 1);

    if (!result.success) {
      setNotice({
        tone: 'error',
        message: result.error || 'Failed to add item to cart. Try again.',
      });
      setActiveCartPartId(null);
      return;
    }

    setActiveCartPartId(partId);
    setNotice({
      tone: 'success',
      message: 'Part added to cart.',
    });
    router.refresh();

    window.setTimeout(() => {
      setActiveCartPartId((current) => (current === partId ? null : current));
    }, 1400);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-20 sm:gap-8 sm:px-6 sm:pt-24 lg:px-12">
      <PageHero partCount={parts.length} activeFilterCount={activeFilterCount} />

      <div className="rounded-[1.25rem] border border-ct-text-secondary/10 bg-[linear-gradient(180deg,rgba(17,23,37,0.94),rgba(7,10,18,0.98))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:p-6">
        <div className="flex items-end gap-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <SearchField
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-14 rounded-xl px-4 uppercase tracking-[0.14em]"
            aria-expanded={showMobileFilters}
            aria-controls="catalog-mobile-filters"
            onClick={() => setShowMobileFilters((current) => !current)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="hidden lg:block">
          <SearchField
            ref={searchInputRef}
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
          />
        </div>

        <div
          id="catalog-mobile-filters"
          className={`${showMobileFilters ? 'mt-4 grid' : 'hidden'} gap-4 md:grid-cols-3 lg:mt-4 lg:grid`}
        >
          <FilterSelect
            id="catalog-model"
            label="Model"
            placeholder="All Models"
            value={model}
            options={filters.models}
            onChange={setModel}
          />
          <FilterSelect
            id="catalog-bucket"
            label="Bucket"
            placeholder="All Buckets"
            value={bucket}
            options={filters.buckets}
            onChange={setBucket}
          />
          <FilterSelect
            id="catalog-quality"
            label="Quality"
            placeholder="All Quality"
            value={quality}
            options={filters.qualities}
            onChange={setQuality}
          />
        </div>

        <div className="mt-5 border-t border-ct-text-secondary/10 pt-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="text-micro text-ct-text-secondary">Brands</div>
              <div className="-mx-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
                <div className="flex min-w-max gap-2 lg:flex-wrap">
                  <FilterChip
                    active={brand === ''}
                    label="All Brands"
                    count={totalBrandCount}
                    onClick={() => setBrand('')}
                  />
                  {filters.brands.map((option) => (
                    <FilterChip
                      key={option.value}
                      active={brand === option.value}
                      label={option.label}
                      count={option.count}
                      onClick={() => setBrand(brand === option.value ? '' : option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:max-w-[22rem] lg:justify-end">
              <Badge variant="accent" className="rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                Live Wholesale Inventory
              </Badge>
              {activeFilterCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-md border border-ct-text-secondary/10 uppercase tracking-[0.16em]"
                  onClick={clearFilters}
                >
                  Reset Filters
                </Button>
              ) : null}
            </div>
          </div>

          {activeFilterCount > 0 ? (
            <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-1 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
              <div className="flex min-w-max items-center gap-2 lg:flex-wrap">
                <span className="text-micro text-ct-text-secondary">Active</span>
                {search.trim() ? (
                  <ActiveFilter label={`Search: ${search.trim()}`} onClear={() => setSearch('')} />
                ) : null}
                {brand ? <ActiveFilter label={`Brand: ${brand}`} onClear={() => setBrand('')} /> : null}
                {model ? <ActiveFilter label={`Model: ${model}`} onClear={() => setModel('')} /> : null}
                {bucket ? <ActiveFilter label={`Bucket: ${bucket}`} onClear={() => setBucket('')} /> : null}
                {quality ? <ActiveFilter label={`Quality: ${quality}`} onClear={() => setQuality('')} /> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div aria-live="polite" className="min-h-0">
        {notice ? <InlineNotice notice={notice} /> : null}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => setRequestVersion((current) => current + 1)} />
      ) : (
        <div className="rounded-[1.25rem] border border-ct-text-secondary/10 bg-ct-bg-secondary/30">
          <div className="flex flex-col gap-3 border-b border-ct-text-secondary/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="text-micro text-ct-text-secondary">Results</div>
              <h2 className="text-2xl font-semibold text-ct-text text-pretty sm:text-3xl">
                Matching Inventory
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-ct-text-secondary">
                Browse wholesale-ready parts, validate fitment, and add inventory to the cart without
                leaving the catalog.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                {parts.length} Parts
              </Badge>
              <Badge variant="outline" className="rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                Stock-First Ordering
              </Badge>
            </div>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : parts.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 xl:grid-cols-3">
              {parts.map((part, index) => (
                <ResultCard
                  key={part.id}
                  part={part}
                  index={index}
                  inCart={activeCartPartId === part.id}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PageHero({
  partCount,
  activeFilterCount,
}: {
  partCount: number;
  activeFilterCount: number;
}) {
  return (
    <header className="space-y-6 text-center">
      <div className="space-y-3">
        <p className="text-micro text-ct-accent">Wholesale Operations</p>
        <h1 className="heading-display text-4xl text-ct-text text-pretty sm:text-5xl lg:text-6xl">
          PARTS <span className="text-ct-accent">CATALOG</span>
        </h1>
        <p className="mx-auto max-w-3xl text-sm leading-7 text-ct-text-secondary sm:text-base">
          Search live inventory by SKU, model, and part family, then move directly into quote and cart
          workflows without losing fitment context.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
        <HeroMetric label="Available Parts" value={String(partCount)} />
        <HeroMetric label="Active Filters" value={String(activeFilterCount)} />
        <HeroMetric label="Source" value="Neon + Prisma" accent />
      </div>
    </header>
  );
}

function HeroMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[1rem] border border-ct-text-secondary/10 bg-ct-bg-secondary/30 px-4 py-4 text-left">
      <div className="text-micro text-ct-text-secondary">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${accent ? 'text-ct-accent' : 'text-ct-text'}`}>
        {value}
      </div>
    </div>
  );
}

const SearchField = forwardRef<HTMLInputElement, {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}>(function SearchField(
  {
    value,
    onChange,
    onClear,
  },
  ref
) {
  return (
    <label htmlFor="catalog-search" className="block space-y-2">
      <div className="text-micro text-ct-text-secondary">Search Inventory</div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ct-text-secondary/60" />
        <Input
          ref={ref}
          id="catalog-search"
          name="search"
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search wholesale parts inventory"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search SKU, model, or part type…"
          className="h-14 rounded-xl border-ct-text-secondary/10 bg-ct-bg/70 pl-11 pr-24 text-sm sm:text-base"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={onClear}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ct-text-secondary/10 bg-ct-bg-secondary/80 text-ct-text-secondary transition-[border-color,color,background-color] hover:border-ct-text-secondary/30 hover:text-ct-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ct-bg"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <kbd className="hidden rounded-md border border-ct-text-secondary/10 bg-ct-bg-secondary/70 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ct-text-secondary sm:inline-flex">
            /
          </kbd>
        </div>
      </div>
    </label>
  );
});

function FilterSelect({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: FacetOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <div className="text-micro text-ct-text-secondary">{label}</div>
      <select
        id={id}
        name={id}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full rounded-xl border border-ct-text-secondary/10 bg-ct-bg/70 px-4 text-sm text-ct-text transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ct-bg"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-[border-color,color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ct-bg ${
        active
          ? 'border-ct-accent bg-ct-accent/10 text-ct-text shadow-[0_0_20px_rgba(0,229,192,0.12)]'
          : 'border-ct-text-secondary/10 bg-ct-bg/45 text-ct-text-secondary hover:border-ct-text-secondary/30 hover:text-ct-text'
      }`}
    >
      <span>{label}</span>
      <span className="font-mono text-[11px] text-current/80">{count}</span>
    </button>
  );
}

function ActiveFilter({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-2 rounded-full border border-ct-accent/20 bg-ct-accent/10 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-ct-accent transition-[border-color,color,background-color] hover:border-ct-accent/40 hover:text-ct-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ct-bg"
    >
      <span>{label}</span>
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

function InlineNotice({ notice }: { notice: NoticeState }) {
  const toneClasses =
    notice.tone === 'success'
      ? 'border-ct-accent/20 bg-ct-accent/10 text-ct-text'
      : 'border-red-500/20 bg-red-500/10 text-red-200';

  return (
    <div className={`flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm ${toneClasses}`}>
      {notice.tone === 'success' ? (
        <Sparkles className="h-4 w-4 text-ct-accent" aria-hidden="true" />
      ) : (
        <CircleAlert className="h-4 w-4 text-red-300" aria-hidden="true" />
      )}
      <span>{notice.message}</span>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/5 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <CircleAlert className="mt-0.5 h-5 w-5 text-red-300" aria-hidden="true" />
        <div className="space-y-3">
          <div>
            <div className="text-lg font-semibold text-red-200">Error Loading Catalog</div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-red-100/85">
              {message} Refresh the catalog and try again.
            </p>
          </div>
          <Button type="button" variant="outline" className="rounded-md" onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="rounded-full border border-ct-text-secondary/10 bg-ct-bg/70 p-4">
        <Package2 className="h-8 w-8 text-ct-text-secondary/40" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <div className="text-xl font-semibold text-ct-text">No matching parts found</div>
        <p className="max-w-md text-sm leading-6 text-ct-text-secondary">
          Broaden the search terms or clear one or more filters to inspect the seeded wholesale
          inventory.
        </p>
      </div>
      <Button type="button" variant="outline" className="rounded-md" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="h-[320px] rounded-[1rem] border border-ct-text-secondary/10 bg-ct-bg/50 animate-pulse"
        />
      ))}
    </div>
  );
}

function ResultCard({
  part,
  index,
  inCart,
  onAddToCart,
}: {
  part: PartRecord;
  index: number;
  inCart: boolean;
  onAddToCart: (partId: string) => Promise<void>;
}) {
  const compatibilityPreview = part.compatibilities.slice(0, 3);
  const remainingCompatibilities = part.compatibilities.length - compatibilityPreview.length;

  return (
    <article
      className={`animate-rise-in flex h-full flex-col rounded-[1rem] border border-ct-text-secondary/10 bg-[linear-gradient(180deg,rgba(17,23,37,0.72),rgba(7,10,18,0.92))] p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-ct-accent/25 hover:shadow-[0_18px_35px_rgba(0,0,0,0.28)] ${
        index % 3 === 0 ? 'animation-delay-100' : index % 3 === 1 ? 'animation-delay-200' : 'animation-delay-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-micro text-ct-text-secondary">Golden SKU</div>
          <div className="mt-2 truncate font-mono text-sm text-ct-text">{part.sku}</div>
        </div>
        <Badge
          variant={part.stock > 0 ? 'accent' : 'destructive'}
          className="rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
        >
          {part.stock > 0 ? `${part.stock} In Stock` : 'Out of Stock'}
        </Badge>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={qualityVariant(part.quality.name)} className="rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            {part.quality.name}
          </Badge>
          <Badge variant="outline" className="rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            {part.brand}
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ct-text text-pretty">{part.partType.name}</h3>
          <p className="text-sm leading-6 text-ct-text-secondary">{part.primaryDeviceLabel}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-[0.875rem] border border-ct-text-secondary/10 bg-ct-bg/45 p-4 sm:grid-cols-2">
        <MetaRow label="Bucket" value={part.partType.bucket.name} />
        <MetaRow label="Supplier" value={part.supplier || 'CellTech Stock'} />
        <MetaRow label="Model" value={part.model} />
        <MetaRow label="Fitments" value={String(part.compatibilities.length)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {compatibilityPreview.map((compatibility) => (
          <span
            key={compatibility.id}
            className="rounded-md border border-ct-text-secondary/10 bg-ct-bg/55 px-2.5 py-1 text-xs text-ct-text-secondary"
          >
            {compatibility.phone.label}
          </span>
        ))}
        {remainingCompatibilities > 0 ? (
          <span className="rounded-md border border-ct-accent/20 bg-ct-accent/10 px-2.5 py-1 text-xs text-ct-accent">
            +{remainingCompatibilities} more
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 border-t border-ct-text-secondary/10 pt-5">
        <div>
          <div className="text-micro text-ct-text-secondary">Wholesale Price</div>
          <div className="mt-2 text-2xl font-semibold text-ct-text">{formatCurrency(part.price)}</div>
        </div>

        <Button
          type="button"
          variant={part.stock > 0 ? 'primary' : 'secondary'}
          className="rounded-md px-5 uppercase tracking-[0.16em]"
          disabled={part.stock === 0}
          onClick={() => onAddToCart(part.id)}
        >
          {inCart ? 'Queued' : 'Add to Cart'}
        </Button>
      </div>
    </article>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-micro text-ct-text-secondary">{label}</div>
      <div className="mt-2 truncate text-sm text-ct-text">{value}</div>
    </div>
  );
}
