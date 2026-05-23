import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Leaf, Heart, Sparkles, Shield } from 'lucide-react';
import { products } from '../data/products';

export function HomePage() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-accent/30 to-background py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Leaf className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Diatomlife Products
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2 italic">
            Nature's Gift To Humanity
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium natural healthcare products to support your wellness journey with the power of nature.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link to="/water-tracker">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Track Your Water Intake
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Introduction */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to Wellness
            </h2>
            <p className="text-muted-foreground">
              At Diatomlife Products, we believe in harnessing the power of nature to support your health and vitality.
              Our carefully crafted supplements combine traditional wisdom with modern science to bring you products
              that truly make a difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Leaf className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">100% Natural</h3>
                <p className="text-sm text-muted-foreground">
                  Pure ingredients sourced from nature
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Science-Backed</h3>
                <p className="text-sm text-muted-foreground">
                  Formulas based on research and tradition
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Quality Assured</h3>
                <p className="text-sm text-muted-foreground">
                  Rigorous testing for purity and potency
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Made with Care</h3>
                <p className="text-sm text-muted-foreground">
                  Crafted with your wellness in mind
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-accent/10">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-primary mb-2">{product.category}</p>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <Link to={`/products/${product.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/products">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Water Tracker CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Hydrated, Stay Healthy</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Track your daily water intake with our interactive hydration monitor.
                Proper hydration is essential for optimal health and wellness.
              </p>
              <Link to="/water-tracker">
                <Button size="lg">Start Tracking Water</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-accent/10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                text: 'The Vitamin C Complex has made such a difference in my energy levels. I feel healthier and more vibrant!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                text: 'I love the natural approach. These products work without harsh chemicals or side effects.',
                rating: 5
              },
              {
                name: 'Emma Williams',
                text: 'The water tracker helped me build better hydration habits. Combined with the supplements, I feel amazing!',
                rating: 5
              }
            ].map((testimonial, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-primary">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold">— {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Wellness Community</h2>
          <p className="text-muted-foreground mb-6">
            Subscribe to receive health tips, exclusive offers, and the latest updates from Diatomlife Products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-border rounded-md bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
