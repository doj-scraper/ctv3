import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: string;
  image?: string | null;
  inventory: number;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  const { addItem } = useCart();
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingProductId(product.id);
      await addItem(product.id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error(error);
    } finally {
      setAddingProductId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
          {product.image && (
            <div className="h-48 overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          )}

          <CardHeader className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            {product.description && (
              <CardDescription className="line-clamp-2">
                {product.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
              </span>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              disabled={product.inventory === 0 || addingProductId === product.id}
              onClick={() => handleAddToCart(product)}
            >
              {addingProductId === product.id ? (
                'Adding...'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
