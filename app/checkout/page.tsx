'use client';
import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

    if (!priceId) {
      setError('Stripe price ID is not configured for this environment.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Checkout failed. Please try again.');
        return;
      }
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="checkout-page" className="flex flex-col items-center justify-center min-h-screen bg-ct-bg text-ct-text p-8">
      <h1 data-testid="checkout-heading" className="heading-display text-ct-accent mb-4">Checkout</h1>
      {error && <p data-testid="checkout-error" className="text-red-500 mb-4">{error}</p>}
      <button data-testid="pay-now-button" onClick={handleCheckout} disabled={loading} className="px-6 py-3 bg-ct-accent text-ct-bg rounded-xl hover:shadow-lg">
        {loading ? 'Redirecting...' : 'Pay Now'}
      </button>
    </div>
  );
}
