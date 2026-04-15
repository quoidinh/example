import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Package, Bot } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-emerald-800">Switch Supply</h1>
          <p className="text-xs text-gray-400">Ingredient Intelligence</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
            <LayoutDashboard size={18} />
            Products
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Package size={18} />
            Suppliers
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Bot size={18} />
            AI Insights
          </a>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="truncate max-w-[120px] font-medium text-gray-600">{user.email}</span>
            <form action="/api/auth/sign-out" method="post">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                <LogOut size={16} />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
