'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function getUserOrders() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'User not found in database' };
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            part: {
              select: {
                id: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    return { success: true, orders };
  } catch (error: unknown) {
    console.error('Failed to fetch orders:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to fetch orders') };
  }
}
