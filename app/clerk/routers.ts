
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
  }),

  // ============ Products Router ============
  products: router({
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),
  }),

  // ============ Cart Router ============
  cart: router({
    getCart: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      
      // Calculate totals
      const subtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price.toString()) * item.quantity);
      }, 0);
      
      return {
        items,
        subtotal,
        itemCount: items.length,
      };
    }),

    addItem: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().int().positive().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify product exists
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new Error("Product not found");
        }

        // Check inventory
        if (product.inventory < input.quantity) {
          throw new Error("Insufficient inventory");
        }

        await db.addCartItem(ctx.user.id, input.productId, input.quantity);
        
        return { success: true };
      }),

    updateQuantity: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().int().nonnegative(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateCartItemQuantity(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeCartItem(ctx.user.id, input.productId);
        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ Checkout Router ============
  checkout: router({
    createSession: protectedProcedure
      .input(z.object({
        origin: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get cart items
        const cartItems = await db.getCartItems(ctx.user.id);
        
        if (cartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        // Create Stripe line items
        const lineItems = cartItems.map(item => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product.name,
              images: item.product.image ? [item.product.image] : [],
            },
            unit_amount: Math.round(parseFloat(item.product.price.toString()) * 100), // Convert to cents
          },
          quantity: item.quantity,
        }));

        // Calculate total
        const total = cartItems.reduce((sum, item) => {
          return sum + (parseFloat(item.product.price.toString()) * item.quantity);
        }, 0);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${input.origin}/orders?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/cart`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          allow_promotion_codes: true,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      }),
  }),

  // ============ Orders Router ============
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getOrderById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
