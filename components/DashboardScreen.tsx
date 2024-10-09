"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useElectronStore } from '@/hooks/useElectronStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardScreen() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const { getSales, getProducts } = useElectronStore();

  useEffect(() => {
    const fetchData = async () => {
      const sales = await getSales();
      const products = await getProducts();

      setTotalSales(sales.reduce((sum, sale) => sum + sale.total, 0));
      setTotalProducts(products.length);
      setLowStockProducts(products.filter(product => product.stock < 10).length);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const salesByDay = last7Days.map(date => ({
        date,
        total: sales
          .filter(sale => sale.date.startsWith(date))
          .reduce((sum, sale) => sum + sale.total, 0)
      }));

      setSalesData(salesByDay);
    };

    fetchData();
  }, [getSales, getProducts]);

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <ul className="space-y-2">
            <li><Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link></li>
            <li><Link href="/products" className="text-blue-600 hover:underline">Products</Link></li>
            <li><Link href="/sales" className="text-blue-600 hover:underline">Sales</Link></li>
            <li><Link href="/reports" className="text-blue-600 hover:underline">Reports</Link></li>
            <li><Link href="/finances" className="text-blue-600 hover:underline">Finances</Link></li>
            <li><Link href="/settings" className="text-blue-600 hover:underline">Settings</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{lowStockProducts}</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sales Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button asChild>
            <Link href="/products">Manage Products</Link>
          </Button>
          <Button asChild>
            <Link href="/sales">View Sales</Link>
          </Button>
          <Button asChild>
            <Link href="/reports">Generate Reports</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}