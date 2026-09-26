import { Card, CardContent } from '../components/ui/card';
import { Leaf, Target, Eye, Heart, Globe, Recycle } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Leaf className="h-20 w-20 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Diatomlife Products</h1>
        <p className="text-xl text-muted-foreground italic">Nature's Gift To Humanity</p>
      </div>

      {/* Story */}
      <section className="mb-16">
        <Card>
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Diatomlife Products was founded on a simple yet powerful belief: nature provides everything
                we need for optimal health and wellness. Our journey began with a passion for natural healing
                and a commitment to creating products that honor both traditional wisdom and modern science.
              </p>
              <p>
                We source the finest natural ingredients from sustainable farms and trusted suppliers around
                the world. Each product is carefully formulated to deliver maximum benefits while maintaining
                the integrity of nature's gifts.
              </p>
              <p>
                Today, we're proud to serve thousands of customers who trust us to support their health journey
                with products that are pure, potent, and purposefully crafted.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Mission, Vision, Values */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground">
              To empower people to take control of their health through premium, science-backed natural
              supplements that support overall wellness and vitality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 text-center">
            <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Our Vision</h3>
            <p className="text-muted-foreground">
              To be the world's most trusted source of natural health products, making wellness accessible
              and sustainable for everyone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Our Values</h3>
            <p className="text-muted-foreground">
              Integrity, transparency, quality, sustainability, and a genuine commitment to your health
              and well-being guide everything we do.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Why Choose Us */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Diatomlife Products?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Science-Backed Formulations</h3>
              <p className="text-sm text-muted-foreground">
                Every product is developed with input from nutritionists, herbalists, and health experts
                to ensure optimal efficacy and safety.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Premium Quality Ingredients</h3>
              <p className="text-sm text-muted-foreground">
                We use only the highest quality, sustainably sourced ingredients, tested for purity
                and potency to meet our strict standards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Transparent Practices</h3>
              <p className="text-sm text-muted-foreground">
                We believe in complete transparency. Every ingredient is clearly listed, and we're
                always happy to answer your questions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Customer-First Approach</h3>
              <p className="text-sm text-muted-foreground">
                Your health and satisfaction are our top priorities. We provide excellent customer
                service and stand behind every product we sell.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sustainability */}
      <section>
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <Globe className="h-12 w-12 text-primary mr-4" />
              <Recycle className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-6">Our Commitment to Sustainability</h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto">
              We believe in protecting the planet that provides our ingredients. That's why we use eco-friendly
              packaging, support sustainable farming practices, and work to minimize our environmental footprint
              at every step. When you choose Diatomlife Products, you're choosing a healthier you and a healthier planet.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
