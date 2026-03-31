// components/product/PartCard.tsx
import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';

interface PartCardProps {
  part: {
    sku: string;
    searchIndex: string;
    price: number | null;
    stock: number;
    quality: { name: string };
    partType: { name: string };
    primaryPhone: {
      generation: string;
      variantName: string | null;
      model: { name: string; brand: { name: string } };
    };
  };
}

export function PartCard({ part }: PartCardProps) {
  const phoneName = `${part.primaryPhone.model.brand.name} ${part.primaryPhone.model.name} ${part.primaryPhone.generation}${part.primaryPhone.variantName ? ' ' + part.primaryPhone.variantName : ''}`;

  return (
    <article className="product-card p-4 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <span className="text-micro text-ct-text-secondary font-mono tracking-tighter">
          {part.sku}
        </span>
        <Badge variant={part.stock > 0 ? 'accent' : 'destructive'}>
          {part.stock > 0 ? `${part.stock} in stock` : 'Out of stock'}
        </Badge>
      </div>

      <div className="mb-4">
        <h3 className="text-ct-text font-semibold text-base mb-1 line-clamp-1">
          {part.partType.name} for {phoneName}
        </h3>
        <Badge variant="default" className="rounded-sm text-[10px] uppercase">
          {part.quality.name}
        </Badge>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-ct-text-secondary/10">
        <div className="flex flex-col">
          <span className="text-ct-text-secondary text-[10px] uppercase tracking-wider">Price</span>
          <span className="text-ct-accent font-bold text-lg">
            {part.price ? formatCurrency(part.price) : 'N/A'}
          </span>
        </div>
        <Button size="sm" disabled={part.stock === 0}>
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
