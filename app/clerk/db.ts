import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, cartItems, orders, orderItems, type Product, type CartItem, type Order, type OrderItem } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.clerkId) {
    throw new Error("User clerkId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      clerkId: user.clerkId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Products Queries ============

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}

export async function getProductById(productId: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Cart Queries ============

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        image: products.image,
        inventory: products.inventory,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  return items;
}

export async function addCartItem(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, userId) && eq(cartItems.productId, productId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function removeCartItem(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(cartItems)
    .where(eq(cartItems.userId, userId) && eq(cartItems.productId, productId));
}

export async function updateCartItemQuantity(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (quantity <= 0) {
    await removeCartItem(userId, productId);
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.userId, userId) && eq(cartItems.productId, productId));
  }
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ============ Orders Queries ============

export async function createOrder(userId: number, total: string, stripeSessionId?: string, stripePaymentIntentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(orders).values({
    userId,
    total: total as any,
    stripeSessionId,
    stripePaymentIntentId,
    status: "pending",
  });

  // Fetch the created order by session ID
  const createdOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, stripeSessionId || ""))
    .limit(1);

  if (createdOrder.length === 0) {
    throw new Error("Failed to create order");
  }

  return createdOrder[0].id;
}

export async function getOrdersByUserId(userId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

  if (order.length === 0) return undefined;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  return {
    ...order[0],
    items,
  };
}

export async function addOrderItem(orderId: number, productId: number, productName: string, quantity: number, price: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(orderItems).values({
    orderId,
    productId,
    productName,
    quantity,
    price: price as any,
  });
}

export async function updateOrderStatus(orderId: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

export async function getOrderByStripeSessionId(stripeSessionId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, stripeSessionId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}
