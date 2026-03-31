'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function getDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error('User not found in database');
  }

  return user;
}

export async function getCart() {
  try {
    const user = await getDbUser();
    return await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        part: {
          include: {
            partType: true,
            primaryPhone: {
              include: {
                model: {
                  include: { brand: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return [];
  }
}

export async function addToCart(partId: string, quantity = 1) {
  try {
    const user = await getDbUser();

    const part = await prisma.partMaster.findUnique({
      where: { id: partId },
      select: { id: true, stock: true },
    });

    if (!part) {
      throw new Error('Item not found');
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_partId: {
          userId: user.id,
          partId,
        },
      },
      select: { quantity: true },
    });

    const requestedQuantity = (existing?.quantity ?? 0) + quantity;
    if (requestedQuantity > part.stock) {
      throw new Error('Requested quantity exceeds available stock');
    }

    await prisma.cartItem.upsert({
      where: {
        userId_partId: {
          userId: user.id,
          partId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: user.id,
        partId,
        quantity,
      },
    });

    revalidatePath('/catalog');
    revalidatePath('/orders');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to add item') };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const user = await getDbUser();

    await prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        userId: user.id,
      },
    });

    revalidatePath('/catalog');
    revalidatePath('/orders');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to remove item' };
  }
}

export async function updateCartQuantity(cartItemId: string, newQuantity: number) {
  try {
    if (newQuantity < 1) {
      return removeFromCart(cartItemId);
    }

    const user = await getDbUser();

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: user.id,
      },
      select: {
        part: {
          select: { stock: true },
        },
      },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (newQuantity > cartItem.part.stock) {
      throw new Error('Requested quantity exceeds available stock');
    }

    await prisma.cartItem.updateMany({
      where: {
        id: cartItemId,
        userId: user.id,
      },
      data: { quantity: newQuantity },
    });

    revalidatePath('/catalog');
    revalidatePath('/orders');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to update quantity') };
  }
}
