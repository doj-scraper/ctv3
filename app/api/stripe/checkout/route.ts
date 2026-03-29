import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe configuration error: STRIPE_SECRET_KEY is not set.' },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json(
      { error: 'Application base URL is not configured.' },
      { status: 500 },
    );
  }

  const body = await req.json();
  const priceId = typeof body?.priceId === 'string' ? body.priceId : null;

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid or missing priceId' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-08-16' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${appUrl}/success`,
    cancel_url: `${appUrl}/cancel`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: 'Stripe error: checkout session URL was not generated.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
