'use client';
import { SignIn, useAuth } from '@clerk/nextjs';

export default function HomePage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ct-bg text-ct-text">
      {isSignedIn ? (
        <>
          <p className="text-ct-text mb-4">Welcome! Proceed to checkout.</p>
          <a href="/checkout" className="text-ct-accent underline">Go to Checkout</a>
        </>
      ) : (
        <SignIn />
      )}
    </div>
  );
}