'use client';
import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ amount: 5000, currency: 'usd' }),
    });
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ct-bg text-ct-text p-8">
      <h1 className="heading-display text-ct-accent mb-4">Checkout</h1>
      <button onClick={handleCheckout} disabled={loading} className="px-6 py-3 bg-ct-accent text-ct-bg rounded-xl hover:shadow-lg">
        {loading ? 'Redirecting...' : 'Pay $50'}
      </button>
    </div>
  );
}