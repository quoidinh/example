import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Tags, Calculator, TrendingUp } from 'lucide-react';

interface SummaryHeaderProps {
  totalProducts: number;
  totalCategories: number;
  avgPrice: string;
}

export function SummaryHeader({ totalProducts, totalCategories, avgPrice }: SummaryHeaderProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">Unique SKUs in catalog</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCategories}</div>
          <p className="text-xs text-muted-foreground">Ingredient segments</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-amber-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Unit Price</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${avgPrice}</div>
          <p className="text-xs text-muted-foreground">Weighted average per kg/unit</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-rose-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2.4%</div>
          <p className="text-xs text-muted-foreground">Price change (last 30 days)</p>
        </CardContent>
      </Card>
    </div>
  );
}
