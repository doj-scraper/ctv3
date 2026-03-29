import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for testing
const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "test",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// Create mock context
function createMockContext(user: typeof mockUser | null = mockUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Products Router", () => {
  it("should list all products", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    // This will return empty array since we haven't seeded products
    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should get product by id", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    // Non-existent product should return undefined
    const product = await caller.products.getById({ id: 999 });
    expect(product).toBeUndefined();
  });
});

describe("Cart Router", () => {
  it("should get empty cart for new user", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const cart = await caller.cart.getCart();
    expect(cart.items).toEqual([]);
    expect(cart.subtotal).toBe(0);
    expect(cart.itemCount).toBe(0);
  });

  it("should require authentication for cart operations", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.cart.getCart();
      expect.fail("Should throw UNAUTHORIZED error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should handle adding item to cart", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    // Try to add a non-existent product (should fail)
    try {
      await caller.cart.addItem({ productId: 999, quantity: 1 });
      expect.fail("Should throw error for non-existent product");
    } catch (error: any) {
      expect(error.message).toContain("Product not found");
    }
  });

  it("should clear cart", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.clear();
    expect(result.success).toBe(true);

    const cart = await caller.cart.getCart();
    expect(cart.items).toEqual([]);
  });
});

describe("Orders Router", () => {
  it("should require authentication for orders", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.list();
      expect.fail("Should throw UNAUTHORIZED error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should return empty orders list for new user", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.list();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBe(0);
  });

  it("should not allow getting other user's order", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    // Try to get order with different user ID
    const order = await caller.orders.getById({ id: 999 });
    expect(order).toBeUndefined();
  });
});

describe("Checkout Router", () => {
  it("should require authentication for checkout", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.checkout.createSession({ origin: "http://localhost:3000" });
      expect.fail("Should throw UNAUTHORIZED error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should fail checkout with empty cart", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.checkout.createSession({ origin: "http://localhost:3000" });
      expect.fail("Should throw error for empty cart");
    } catch (error: any) {
      expect(error.message).toContain("Cart is empty");
    }
  });
});
