import React from 'react';

import { cn } from '@/lib/utils';

type SectionIntroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        'space-y-4',
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      <div className={cn('text-micro text-ct-accent', align === 'center' ? 'justify-center' : '')}>
        {eyebrow}
      </div>
      <div className="space-y-4">
        <div className="heading-display text-4xl text-ct-text sm:text-5xl lg:text-6xl">{title}</div>
        <div
          className={cn(
            'text-sm leading-7 text-ct-text-secondary sm:text-base',
            align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-2xl'
          )}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
