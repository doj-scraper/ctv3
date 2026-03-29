import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { useState } from "react";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: selectedOrder } = trpc.orders.getById.useQuery(
    { id: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to view your order history
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Login</a>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Button asChild variant="outline">
                <a href="/">Continue Shopping</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedOrderId(order.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${parseFloat(order.total).toFixed(2)}
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order #{selectedOrder.id}</CardTitle>
                  <CardDescription>
                    {format(new Date(selectedOrder.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrderId(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-4">Items</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items in this order</p>
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Stripe Info */}
              {selectedOrder.stripeSessionId && (
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <p>Session ID: {selectedOrder.stripeSessionId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
