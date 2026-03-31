import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div data-testid="clerk-page" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ct-bg px-6 text-center text-ct-text">
      <div className="space-y-3">
        <h1 data-testid="clerk-heading" className="heading-display text-ct-accent">CellTech Checkout</h1>
        <p className="max-w-xl text-sm text-ct-text/80">
          Sign in with Clerk to access the protected checkout flow. If you are already signed in,
          you can continue directly to checkout.
        </p>
      </div>

      <Link href="/checkout" data-testid="continue-to-checkout-link" className="text-ct-accent underline">
        Continue to Checkout
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/10 p-4">
        <SignIn />
      </div>
    </div>
  );
}
