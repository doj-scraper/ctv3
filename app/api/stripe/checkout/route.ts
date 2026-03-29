import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-08-16' });

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const priceId = typeof body?.priceId === 'string' ? body.priceId : null;
export async function POST(req: Request) {
  const { amount = 5000, currency = 'usd' } = await req.json();

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe configuration error: STRIPE_SECRET_KEY is not set.' },
      { status: 500 },
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-08-16' });

  const origin = req.headers.get('origin') || '';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: 'Order' },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/success`,
    cancel_url: `${origin}/cancel`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: 'Stripe error: checkout session URL was not generated.' },
      { status: 500 },
    );
  }
  return NextResponse.json({ url: session.url });
}