import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { formatKES } from '../services/products';
import type { Product } from '../lib/supabase';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80';

export function ProductCard({ product }: { product: Product }) {
  const inStock = (product.stock_quantity ?? 0) > 0;
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product.slug}`} className="block aspect-square overflow-hidden">
        <img
          src={product.image_url || FALLBACK_IMG}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>
      <CardContent className="p-6">
        <p className="text-sm text-primary mb-2">{product.categories?.name ?? ''}</p>
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{formatKES(product.price_kes)}</span>
          <Link to={`/products/${product.slug}`}>
            <Button>View Details</Button>
          </Link>
        </div>
        {inStock ? (
          <p className="text-sm text-green-600 mt-2">In Stock</p>
        ) : (
          <p className="text-sm text-destructive mt-2">Out of Stock</p>
        )}
      </CardContent>
    </Card>
  );
}
