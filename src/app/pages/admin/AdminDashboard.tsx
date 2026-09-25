import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';

interface Stats {
  products: number;
  lowStock: number;
  pendingPayments: number;
  ordersThisWeek: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        const [{ count: products }, { count: lowStock }, { count: pending }, { count: weekOrders }] =
          await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 5),
            supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_payment'),
            supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
          ]);
        setStats({
          products: products ?? 0,
          lowStock: lowStock ?? 0,
          pendingPayments: pending ?? 0,
          ordersThisWeek: weekOrders ?? 0,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stats');
      }
    }
    load();
  }, []);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!stats)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.products}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock (≤5)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-amber-600">{stats.lowStock}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payment Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-600">{stats.pendingPayments}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders This Week</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.ordersThisWeek}</CardContent>
        </Card>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Product management, order verification, blog editor and settings screens are coming in the
        next steps of Phase 3.
      </p>
    </div>
  );
}
