import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-ct-accent/10 blur-[140px]" />
        <div className="absolute bottom-[-6rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-ct-accent/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="animate-rise-in space-y-6">
          <div className="text-micro text-ct-accent">New Account</div>
          <div className="space-y-4">
            <h1 className="heading-display text-4xl text-ct-text sm:text-5xl lg:text-6xl">
              CREATE A <span className="text-ct-accent">CELLTECH</span> ACCOUNT
            </h1>
            <p className="max-w-xl text-sm leading-7 text-ct-text-secondary sm:text-base">
              Open the catalog, place orders, and keep your procurement history tied to one authenticated
              workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <RailCard title="Search first" copy="Jump directly into live inventory and filterable product discovery." />
            <RailCard title="Order ready" copy="Save cart state and build an account ledger for repeat procurement." />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/sign-in" className="text-sm uppercase tracking-[0.16em] text-ct-accent transition-colors hover:text-ct-text">
              Sign In
            </Link>
            <span className="text-ct-text-secondary/30">/</span>
            <Link href="/" className="text-sm uppercase tracking-[0.16em] text-ct-text-secondary transition-colors hover:text-ct-text">
              Return Home
            </Link>
          </div>
        </section>

        <section className="animate-rise-in animation-delay-150 rounded-[1.75rem] border border-ct-text-secondary/10 bg-[linear-gradient(180deg,rgba(17,23,37,0.86),rgba(7,10,18,0.98))] p-4 shadow-[0_28px_60px_rgba(0,0,0,0.34)] sm:p-6">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            appearance={{
              variables: {
                colorPrimary: '#00E5C0',
                colorBackground: '#070A12',
                colorText: '#F2F5FA',
                borderRadius: '1rem',
              },
            }}
          />
        </section>
      </div>
    </div>
  );
}

function RailCard({ title, copy }: { title: string; copy: string }) {
  return (
    <article className="rounded-[1.25rem] border border-ct-text-secondary/10 bg-ct-bg-secondary/30 p-4">
      <div className="text-sm font-semibold text-ct-text">{title}</div>
      <p className="mt-2 text-sm leading-6 text-ct-text-secondary">{copy}</p>
    </article>
  );
}
