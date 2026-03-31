'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { addToCart } from '@/app/actions/cart.actions';

interface AddToCartButtonProps {
  partId: string;
  stock: number;
  className?: string;
}

export function AddToCartButton({ partId, stock, className = '' }: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    if (stock < 1) return;

    startTransition(async () => {
      const result = await addToCart(partId, 1);

      if (result.success) {
        setJustAdded(true);
        router.refresh();
        window.setTimeout(() => setJustAdded(false), 1500);
        return;
      }

      window.alert(result.error || 'Failed to add item to cart');
      setJustAdded(false);
    });
  };

  if (stock < 1) {
    return (
      <button
        disabled
        className={`w-full flex items-center justify-center h-10 rounded-md bg-ct-bg-secondary text-ct-text-secondary/50 border border-ct-text-secondary/10 cursor-not-allowed text-micro ${className}`}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending || justAdded}
      className={`w-full relative flex items-center justify-center h-10 rounded-md overflow-hidden transition-all duration-300 text-micro ${
        justAdded
          ? 'bg-ct-accent text-ct-bg shadow-[0_0_15px_rgba(0,229,192,0.4)] border border-ct-accent'
          : 'bg-ct-bg-secondary text-ct-accent border border-ct-accent/30 hover:bg-ct-accent hover:text-ct-bg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)]'
      } ${className}`}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing
        </span>
      ) : justAdded ? (
        <span className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Queued
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </span>
      )}
    </button>
  );
}
