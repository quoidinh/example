import { createClient } from '@/lib/supabase-server';
import { SummaryHeader } from '@/components/dashboard/summary-header';
import { ProductTable } from '@/components/dashboard/product-table';
import { AiAssistant } from '@/components/dashboard/ai-assistant';
import { QueryHistory, type QueryEntry } from '@/components/dashboard/query-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('name');

  // Fetch recent queries
  let queryHistory: QueryEntry[] = [];
  if (user) {
    const { data: qh, error: qhError } = await supabase
      .from('query_history')
      .select('id, question, answer, confidence, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!qhError && qh) {
      queryHistory = qh;
    }
  }

  if (productsError) {
    return <div className="p-8 text-red-500">Error loading products: {productsError.message}</div>;
  }

  // Calculate stats
  const totalProducts = products?.length || 0;
  const categories = new Set(products?.map(p => p.category));
  const totalCategories = categories.size;
  const avgPrice = products?.length 
    ? (products.reduce((acc, p) => acc + Number(p.unit_price), 0) / products.length).toFixed(2)
    : '0.00';

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Product Intelligence</h2>
        <p className="text-muted-foreground">Monitor and analyze your ingredient inventory and pricing patterns.</p>
      </div>

      <SummaryHeader 
        totalProducts={totalProducts}
        totalCategories={totalCategories}
        avgPrice={avgPrice}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <ProductTable products={products || []} />
        </div>
        <div className="xl:col-span-1 space-y-8">
          <AiAssistant />
          <QueryHistory queries={queryHistory} />
        </div>
      </div>
    </div>
  );
}
