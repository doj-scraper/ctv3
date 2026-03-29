import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { CartDrawer } from './CartDrawer';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const itemCount = cart?.itemCount || 0;

  return (
    <>
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">CommerceAuth</h1>
            <nav className="hidden md:flex gap-6">
              <a href="/" className="text-sm hover:text-primary transition">
                Shop
              </a>
              {isAuthenticated && (
                <>
                  <a href="/cart" className="text-sm hover:text-primary transition">
                    Cart
                  </a>
                  <a href="/orders" className="text-sm hover:text-primary transition">
                    Orders
                  </a>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.name || user?.email}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>

                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
