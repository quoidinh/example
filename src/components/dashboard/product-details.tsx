'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2, TrendingUp, History, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  unit_price: number;
  stock_quantity: number;
  supplier_name: string;
  country_of_origin: string;
}

interface PricePoint {
  date_recorded: string;
  price: number;
}

export function ProductDetails({ product }: { product: Product }) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const { data, error } = await supabase
        .from('price_history')
        .select('date_recorded, price')
        .eq('product_id', product.id)
        .order('date_recorded', { ascending: true });

      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    }
    fetchHistory();
  }, [product.id]);

  return (
    <Card className="shadow-lg border-emerald-100 overflow-hidden">
      <CardHeader className="bg-emerald-50/50 pb-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2 bg-emerald-600">{product.category}</Badge>
            <CardTitle className="text-2xl text-emerald-900">{product.name}</CardTitle>
            <CardDescription className="text-emerald-700/70 font-mono text-xs mt-1">
              SKU: {product.sku} | Origin: {product.country_of_origin}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">${product.unit_price}</div>
            <div className="text-xs text-gray-500 uppercase">per {product.unit_of_measure}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-semibold text-gray-900 border-b pb-2">
              <Info className="h-4 w-4 text-emerald-600" />
              Supplier Information
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Managing Supplier</span>
                <span className="text-sm font-medium">{product.supplier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current Stock</span>
                <Badge variant={product.stock_quantity < 10 ? 'destructive' : 'outline'}>
                  {product.stock_quantity} {product.unit_of_measure}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Country of Origin</span>
                <span className="text-sm font-medium">{product.country_of_origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Inventory Status</span>
                <span className={`text-sm font-bold ${product.stock_quantity > 20 ? 'text-emerald-600' : product.stock_quantity > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 20 ? 'Healthy' : product.stock_quantity > 5 ? 'Warning' : 'Critical'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold text-gray-900 border-b pb-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Price Trend (Last 3 Months)
            </div>
            <div className="h-[200px] w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-emerald-600" />
                </div>
              ) : history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date_recorded" 
                      tick={{fontSize: 10}}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-AU', { month: 'short' })}
                    />
                    <YAxis 
                      tick={{fontSize: 10}} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#059669" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No price history available.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
