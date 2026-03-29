import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, isLoading, removeItem, updateQuantity } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const createSession = trpc.checkout.createSession.useMutation();

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const result = await createSession.mutateAsync({
        origin: window.location.origin,
      });

      if (result.url) {
        window.open(result.url, '_blank');
        toast.success('Redirecting to checkout...');
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cart?.subtotal || 0;
  const tax = subtotal * 0.1; // 10% tax for demo
  const total = subtotal + tax;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Shopping Cart</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading cart...</p>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-muted-foreground">Your cart is empty</p>
              <DrawerClose asChild>
                <Button variant="outline" size="sm">
                  Continue Shopping
                </Button>
              </DrawerClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b pb-4">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(item.product.price).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.inventory}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t px-4 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <DrawerFooter>
          {cart && cart.items.length > 0 && (
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full"
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
