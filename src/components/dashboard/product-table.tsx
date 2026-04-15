'use client';

import { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { ProductDetails } from './product-details';

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

export function ProductTable({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'price' | 'stock' | 'name'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let valA, valB;
        if (sortBy === 'price') {
          valA = a.unit_price;
          valB = b.unit_price;
        } else if (sortBy === 'stock') {
          valA = a.stock_quantity;
          valB = b.stock_quantity;
        } else {
          valA = a.name;
          valB = b.name;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, categoryFilter, sortBy, sortOrder]);

  const handleSort = (field: 'price' | 'stock' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Inventory List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search name or SKU..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'all')}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Product <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort('price')}>
                    Price <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort('stock')}>
                    Stock <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                  </TableHead>
                  <TableHead>Origin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow 
                    key={p.id} 
                    className={`cursor-pointer hover:bg-emerald-50/30 transition-colors ${selectedProduct?.id === p.id ? 'bg-emerald-50' : ''}`}
                    onClick={() => setSelectedProduct(p)}
                  >
                    <TableCell className="py-4">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-700">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${p.unit_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-2 ${p.stock_quantity < 10 ? 'text-red-600 font-bold' : ''}`}>
                        {p.stock_quantity}
                        {p.stock_quantity < 10 && (
                          <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{p.unit_of_measure}</div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {p.country_of_origin}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      No products found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <ProductDetails product={selectedProduct} />
      )}
    </div>
  );
}
