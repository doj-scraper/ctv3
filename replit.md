# CellTech E-Commerce

A Next.js e-commerce app with Clerk authentication and Stripe payments.

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Running the App
The workflow `Start application` runs `pnpm run dev` on port 5000.

## Environment Variables Required
See `.env.example` for all required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk public key
- `CLERK_SECRET_KEY` — Clerk secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe public key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `NEXT_PUBLIC_STRIPE_PRICE_ID` — Stripe price ID for the product
- `NEXT_PUBLIC_APP_URL` — The full public URL of the app (e.g. your `.replit.app` domain)
- `DATABASE_URL` — (if used) PostgreSQL connection string

## Project Structure
- `app/` — Next.js App Router pages and API routes
- `app/api/stripe/checkout/route.ts` — Stripe checkout session API (server-side, auth-protected)
- `app/layout.tsx` — Root layout with ClerkProvider
- `app/page.tsx` — Home page (shows Clerk SignIn or checkout link)
- `app/checkout/page.tsx` — Checkout page
- `app/success/page.tsx` — Post-payment success page
- `app/cancel/page.tsx` — Payment cancelled page
