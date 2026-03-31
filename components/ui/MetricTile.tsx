import React from 'react';

import { cn } from '@/lib/utils';

type MetricTileProps = {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  className?: string;
};

export function MetricTile({
  label,
  value,
  accent = false,
  className,
}: MetricTileProps) {
  return (
    <div
      className={cn(
        'rounded-[1.1rem] border border-ct-text-secondary/10 bg-ct-bg-secondary/30 p-4',
        className
      )}
    >
      <div className="text-micro text-ct-text-secondary">{label}</div>
      <div className={cn('mt-2 text-2xl font-semibold text-ct-text', accent && 'text-ct-accent')}>
        {value}
      </div>
    </div>
  );
}
