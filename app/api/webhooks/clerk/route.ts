import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address?: string | null;
    }>;
    first_name?: string | null;
    last_name?: string | null;
  };
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to your environment');
  }

  const headerStore = await headers();
  const svixId = headerStore.get('svix-id');
  const svixTimestamp = headerStore.get('svix-timestamp');
  const svixSignature = headerStore.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(webhookSecret);

  let evt: ClerkWebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (error) {
    console.error('Error verifying Clerk webhook:', error);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address ?? null;
    const name = [first_name, last_name].filter(Boolean).join(' ') || null;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name,
        lastSignedIn: new Date(),
      },
      create: {
        clerkId: id,
        email,
        name,
        lastSignedIn: new Date(),
      },
    });
  }

  return NextResponse.json({ success: true });
}
