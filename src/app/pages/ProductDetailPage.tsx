import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ShoppingCart, Heart, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../contexts/CartContext';
import { formatKES, fetchActiveProducts, fetchProductBySlug } from '../services/products';
import type { Product } from '../lib/supabase';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80';

export function ProductDetailPage() {
  const { id } = useParams(); // slug
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (!id) {
      setLoading(false);
      return;
    }
    fetchProductBySlug(id)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        if (p?.category_id) {
          const all = await fetchActiveProducts();
          if (!cancelled) setRelated(all.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 3));
        }
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Failed to load product'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/products"><Button>Back to Products</Button></Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const inStock = (product.stock_quantity ?? 0) > 0;

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.image_url || FALLBACK_IMG}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div>
          {product.categories?.name && <Badge className="mb-4">{product.categories.name}</Badge>}
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mb-6">{formatKES(product.price_kes)}</p>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="flex gap-4 mb-8">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={!inStock}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {inStock ? (
            <p className="text-green-600">&#10003; In Stock ({product.stock_quantity} available)</p>
          ) : (
            <p className="text-destructive">Out of Stock</p>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="story" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="story">The Story</TabsTrigger>
            <TabsTrigger value="science">The Science</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="usage">How to Use</TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">The Holistic Story</h3>
                <p className="text-muted-foreground leading-relaxed">{product.holistic_story}</p>
                {(product.benefits?.length ?? 0) > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-semibold mb-3">Key Benefits</h4>
                    <ul className="space-y-2">
                      {product.benefits!.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-primary mr-2">&#10003;</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="science" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">The Scientific Why</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{product.scientific_why}</p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">
                    <strong>Research-Backed:</strong> This product is formulated based on traditional wisdom
                    and supported by modern nutritional science to help you achieve optimal wellness.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Active Ingredients</h3>
                <ul className="grid md:grid-cols-2 gap-2">
                  {(product.ingredients ?? []).map((ingredient, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">How to Use</h3>
                <p className="mb-4">{product.usage}</p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground italic">
                    <strong>Safety Note:</strong> Consult with a healthcare professional before starting
                    any new supplement regimen, especially if you are pregnant, nursing, or have a medical condition.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Related Products</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {related.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <Link to={`/products/${relatedProduct.slug}`} className="block aspect-square overflow-hidden">
                  <img
                    src={relatedProduct.image_url || FALLBACK_IMG}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                  <p className="text-primary font-bold">{formatKES(relatedProduct.price_kes)}</p>
                  <Link to={`/products/${relatedProduct.slug}`}>
                    <Button className="w-full mt-4">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
