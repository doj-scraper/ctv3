import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { cart, isLoading, removeItem, updateQuantity } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const createSession = trpc.checkout.createSession.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to view your cart and checkout
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Login</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const result = await createSession.mutateAsync({
        origin: window.location.origin,
      });

      if (result.url) {
        window.open(result.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    } catch (error) {
      toast.error("Failed to create checkout session");
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cart?.subtotal || 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild variant="outline">
                <a href="/">Continue Shopping</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.productId}>
                <CardContent className="py-6">
                  <div className="flex gap-6">
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ${parseFloat(item.product.price).toFixed(2)} each
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.inventory}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive ml-auto"
                          onClick={() => handleRemoveItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full"
                  size="lg"
                >
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <a href="/">Continue Shopping</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
