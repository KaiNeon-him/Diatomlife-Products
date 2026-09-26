import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ShoppingCart, Heart, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

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

  const handleAddToCart = () => {
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
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div>
          <Badge className="mb-4">{product.category}</Badge>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mb-6">${product.price}</p>
          
          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="flex gap-4 mb-8">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {product.inStock ? (
            <p className="text-green-600">✓ In Stock</p>
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
                <p className="text-muted-foreground leading-relaxed">{product.holisticStory}</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold mb-3">Key Benefits</h4>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="science" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">The Scientific Why</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{product.scientificWhy}</p>
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
                  {product.ingredients.map((ingredient, idx) => (
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
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Related Products</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {products
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 3)
            .map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                  <p className="text-primary font-bold">${relatedProduct.price}</p>
                  <Link to={`/products/${relatedProduct.id}`}>
                    <Button className="w-full mt-4">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}