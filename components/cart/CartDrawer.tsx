'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Minus, Plus, Trash2, X } from 'lucide-react';

import { getCart, removeFromCart, updateCartQuantity } from '@/app/actions/cart.actions';
import { Button } from '@/components/ui/Button';

type CartItemRecord = Awaited<ReturnType<typeof getCart>>[number];

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function buildPartLabel(item: CartItemRecord) {
  return [
    item.part.primaryPhone.model.brand.name,
    item.part.primaryPhone.model.name,
    item.part.primaryPhone.generation,
    item.part.primaryPhone.variantName,
  ]
    .filter(Boolean)
    .join(' ');
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isMutating, startMutation] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let active = true;
    setIsLoading(true);
    setCheckoutError(null);

    void getCart()
      .then((items) => {
        if (!active) {
          return;
        }

        setCartItems(items);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        console.error('Failed to load cart:', error);
        setCheckoutError('Unable to load the cart.');
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.part.price) * item.quantity, 0),
    [cartItems]
  );

  function refreshHeader() {
    router.refresh();
  }

  function handleRemove(cartItemId: string) {
    const previousItems = cartItems;
    setCheckoutError(null);
    setCartItems((current) => current.filter((item) => item.id !== cartItemId));

    startMutation(async () => {
      const result = await removeFromCart(cartItemId);

      if (!result.success) {
        setCartItems(previousItems);
        setCheckoutError(result.error || 'Failed to remove the item.');
        return;
      }

      refreshHeader();
    });
  }

  function handleQuantityChange(cartItemId: string, nextQuantity: number) {
    if (nextQuantity < 1) {
      handleRemove(cartItemId);
      return;
    }

    const previousItems = cartItems;
    setCheckoutError(null);
    setCartItems((current) =>
      current.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity: Math.min(nextQuantity, item.part.stock),
            }
          : item
      )
    );

    startMutation(async () => {
      const result = await updateCartQuantity(cartItemId, nextQuantity);

      if (!result.success) {
        setCartItems(previousItems);
        setCheckoutError(result.error || 'Failed to update quantity.');
        return;
      }

      refreshHeader();
    });
  }

  async function handleCheckout() {
    setIsCheckoutPending(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });

      const payload = (await response.json()) as {
        error?: string;
        invalidItems?: string[];
        url?: string;
      };

      if (!response.ok) {
        if (response.status === 409 && payload.invalidItems?.length) {
          setCheckoutError(`Inventory changed for: ${payload.invalidItems.join(', ')}`);
          return;
        }

        setCheckoutError(payload.error || 'Checkout failed.');
        return;
      }

      if (!payload.url) {
        setCheckoutError('Stripe checkout URL was not returned.');
        return;
      }

      window.location.assign(payload.url);
    } catch (error) {
      console.error('Checkout failed:', error);
      setCheckoutError('Checkout failed.');
    } finally {
      setIsCheckoutPending(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-ct-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close cart"
      />

      <aside className="animate-slide-in-soft fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-ct-text-secondary/10 bg-ct-bg-secondary shadow-2xl">
        <div className="flex items-center justify-between border-b border-ct-text-secondary/10 p-4 sm:p-6">
          <div>
            <div className="text-micro text-ct-accent">Live Cart</div>
            <h2 className="mt-2 text-xl font-semibold text-ct-text">Active Allocation</h2>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close cart">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-ct-accent" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-ct-text-secondary">Cart is empty</p>
              <p className="max-w-xs text-sm text-ct-text-secondary">
                Add components from the catalog to stage a checkout session.
              </p>
              <Button type="button" onClick={onClose}>
                Return To Catalog
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <article
                  key={item.id}
                  className={`animate-rise-in rounded-xl border border-ct-text-secondary/10 bg-ct-bg/60 p-4 ${
                    index % 3 === 0 ? 'animation-delay-100' : index % 3 === 1 ? 'animation-delay-200' : 'animation-delay-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-micro text-ct-text-secondary">{item.part.sku}</div>
                      <h3 className="mt-2 text-sm font-semibold uppercase tracking-[0.06em] text-ct-text">
                        {item.part.partType.name}
                      </h3>
                      <p className="mt-1 text-sm text-ct-text-secondary">{buildPartLabel(item)}</p>
                      <div className="mt-3 font-mono text-sm text-ct-accent">
                        {formatMoney(Number(item.part.price))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-md p-2 text-ct-text-secondary transition hover:text-red-400"
                      onClick={() => handleRemove(item.id)}
                      disabled={isMutating}
                      aria-label={`Remove ${item.part.sku}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-ct-text-secondary">
                      {item.part.stock > 0 ? `${item.part.stock} available` : 'Out of stock'}
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-ct-text-secondary/10 bg-ct-bg-secondary/70 px-2 py-1">
                      <button
                        type="button"
                        className="text-ct-text-secondary transition hover:text-ct-accent disabled:opacity-50"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isMutating}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm text-ct-text">{item.quantity}</span>
                      <button
                        type="button"
                        className="text-ct-text-secondary transition hover:text-ct-accent disabled:opacity-50"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isMutating || item.quantity >= item.part.stock}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="border-t border-ct-text-secondary/10 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-6 sm:pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ct-text-secondary">Subtotal</span>
              <span className="font-mono text-xl font-semibold text-ct-text">
                {formatMoney(subtotal)}
              </span>
            </div>

            {checkoutError ? (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                {checkoutError}
              </div>
            ) : null}

            <Button
              type="button"
              size="lg"
              className="mt-4 w-full rounded-xl uppercase tracking-[0.14em]"
              onClick={handleCheckout}
              disabled={isCheckoutPending || isMutating}
            >
              {isCheckoutPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating
                </>
              ) : (
                'Secure Checkout'
              )}
            </Button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
