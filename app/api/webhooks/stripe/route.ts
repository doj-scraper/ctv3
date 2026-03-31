import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildPartName(part: {
  partType: { name: string };
  primaryPhone: {
    generation: string;
    variantName: string | null;
    model: {
      name: string;
      brand: { name: string };
    };
  };
}) {
  const deviceLabel = [
    part.primaryPhone.model.brand.name,
    part.primaryPhone.model.name,
    part.primaryPhone.generation,
    part.primaryPhone.variantName,
  ]
    .filter(Boolean)
    .join(' ');

  return `${part.partType.name} for ${deviceLabel}`;
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown webhook error';
    console.error(`Webhook Error: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.user_id;

  if (!userId) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (existingOrder) {
        return;
      }

      const cartItems = await tx.cartItem.findMany({
        where: { userId },
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
      });

      if (cartItems.length === 0) {
        return;
      }

      const total = (session.amount_total ?? 0) / 100;

      const order = await tx.order.create({
        data: {
          userId,
          total,
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          status: 'processing',
          items: {
            create: cartItems.map((item) => {
              const unitPrice = item.part.price ?? 0;
              const lineTotal = Number(unitPrice) * item.quantity;

              return {
                partId: item.partId,
                partSku: item.part.sku,
                partName: buildPartName(item.part),
                quantity: item.quantity,
                unitPrice,
                lineTotal,
              };
            }),
          },
        },
      });

      for (const item of cartItems) {
        const updated = await tx.partMaster.updateMany({
          where: {
            id: item.partId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error(`Insufficient stock for part ${item.part.sku}`);
        }

        const updatedPart = await tx.partMaster.findUnique({
          where: { id: item.partId },
          select: { stock: true },
        });

        await tx.stockLedger.create({
          data: {
            partId: item.partId,
            change: -item.quantity,
            balance: updatedPart?.stock ?? 0,
            reason: 'WEB_SALE',
            reference: `Order_${order.id}`,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId },
      });

      const stripeCustomerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id ?? null;

      if (stripeCustomerId) {
        await tx.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId,
          },
        });
      }
    });
  } catch (error) {
    console.error('[Stripe Webhook] Fulfillment error:', error);
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
