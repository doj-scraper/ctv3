import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ProductGrid } from "@/components/ProductGrid";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: products, isLoading } = trpc.products.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Welcome to CommerceAuth</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover amazing products with secure Stripe checkout
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg">
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="flex-1 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          
          {isAuthenticated ? (
            <ProductGrid products={products || []} isLoading={isLoading} />
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                Sign in to browse and purchase products
              </p>
              <Button asChild size="lg">
                <a href={getLoginUrl()}>Login to Shop</a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
