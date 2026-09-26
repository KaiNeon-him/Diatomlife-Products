import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { products, categories } from '../data/products';
import { Search } from 'lucide-react';

export function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All Products' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our range of premium natural health supplements, carefully formulated to support your wellness goals.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
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
                {product.inStock ? (
                  <p className="text-sm text-green-600 mt-2">In Stock</p>
                ) : (
                  <p className="text-sm text-destructive mt-2">Out of Stock</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('All Products');
              setSearchQuery('');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
