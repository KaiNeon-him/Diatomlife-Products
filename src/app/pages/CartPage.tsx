import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
      
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to add items to your cart
          </p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
