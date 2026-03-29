import express, { Express, Request, Response } from 'express';
import Stripe from 'stripe';
import * as db from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export function registerStripeWebhook(app: Express) {
  // Important: This must be registered BEFORE express.json() middleware
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
      const sig = req.headers['stripe-signature'] as string;

      let event: Stripe.Event;

      try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );
      } catch (error: any) {
        console.error('[Stripe Webhook] Signature verification failed:', error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
      }

      // Handle test events
      if (event.id.startsWith('evt_test_')) {
        console.log('[Stripe Webhook] Test event detected:', event.type);
        return res.json({ verified: true });
      }

      try {
        // Handle different event types
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('[Stripe Webhook] Checkout session completed:', session.id);

            // Get the user ID from metadata
            const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;
            if (!userId) {
              console.error('[Stripe Webhook] No user ID in metadata');
              break;
            }

            // Check if order already exists
            const existingOrder = await db.getOrderByStripeSessionId(session.id);
            if (existingOrder) {
              console.log('[Stripe Webhook] Order already exists for session:', session.id);
              break;
            }

            // Get cart items for the user
            const cartItems = await db.getCartItems(userId);
            if (cartItems.length === 0) {
              console.error('[Stripe Webhook] No cart items found for user:', userId);
              break;
            }

            // Calculate total from session
            const total = (session.amount_total || 0) / 100; // Convert from cents

            // Create order
            const orderId = await db.createOrder(
              userId,
              total.toString(),
              session.id,
              session.payment_intent as string
            );

            // Add order items
            for (const item of cartItems) {
              await db.addOrderItem(
                orderId,
                item.productId,
                item.product.name,
                item.quantity,
                item.product.price.toString()
              );
            }

            // Clear the cart
            await db.clearCart(userId);

            // Update order status to processing
            await db.updateOrderStatus(orderId, 'processing');

            console.log('[Stripe Webhook] Order created:', orderId);
            break;
          }

          case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('[Stripe Webhook] Payment intent succeeded:', paymentIntent.id);
            break;
          }

          case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('[Stripe Webhook] Payment intent failed:', paymentIntent.id);
            break;
          }

          default:
            console.log('[Stripe Webhook] Unhandled event type:', event.type);
        }

        res.json({ received: true });
      } catch (error) {
        console.error('[Stripe Webhook] Error processing event:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    }
  );
}

// Export for use in main server file
export default registerStripeWebhook;
