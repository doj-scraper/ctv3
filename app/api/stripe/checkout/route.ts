import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

function buildPartLabel(item: {
  part: {
    sku: string;
    partType: { name: string };
    primaryPhone: {
      generation: string;
      variantName: string | null;
      model: {
        name: string;
        brand: { name: string };
      };
    };
  };
}) {
  const deviceLabel = [
    item.part.primaryPhone.model.brand.name,
    item.part.primaryPhone.model.name,
    item.part.primaryPhone.generation,
    item.part.primaryPhone.variantName,
  ]
    .filter(Boolean)
    .join(' ');

  return `${item.part.partType.name} for ${deviceLabel}`;
}

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        cartItems: {
          include: {
            part: {
              include: {
                partType: true,
                primaryPhone: {
                  include: {
                    model: {
                      include: {
                        brand: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!dbUser || dbUser.cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty or user not found' }, { status: 400 });
    }

    const outOfStockItems = dbUser.cartItems.filter((item) => item.quantity > item.part.stock);
    if (outOfStockItems.length > 0) {
      return NextResponse.json(
        {
          error: 'Inventory changed. Some items in your cart exceed available stock.',
          invalidItems: outOfStockItems.map((item) => item.part.sku),
        },
        { status: 409 }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = dbUser.cartItems.map((item) => {
      const unitAmount = Math.round(Number(item.part.price ?? 0) * 100);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: buildPartLabel(item),
            metadata: {
              sku: item.part.sku,
            },
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/orders?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/catalog?checkout=cancel`,
      ...(dbUser.stripeCustomerId
        ? { customer: dbUser.stripeCustomerId }
        : { customer_email: dbUser.email || undefined }),
      client_reference_id: dbUser.id,
      metadata: {
        user_id: dbUser.id,
        clerk_id: clerkId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
