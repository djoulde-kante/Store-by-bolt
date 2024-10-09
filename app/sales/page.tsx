"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useElectronStore } from '@/hooks/useElectronStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Sale {
  id: string;
  date: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { getSales } = useElectronStore();
  const router = useRouter();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const fetchedSales = await getSales();
    setSales(fetchedSales);
  };

  const filteredSales = sales.filter(sale =>
    sale.id.includes(searchTerm) || sale.date.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sales History</h1>
      <Button onClick={() => router.push('/')} className="mb-4">Back to Dashboard</Button>
      
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSales.map(sale => (
            <TableRow key={sale.id}>
              <TableCell>{sale.id}</TableCell>
              <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
              <TableCell>${sale.total.toFixed(2)}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Details</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sale Details</DialogTitle>
                    </DialogHeader>
                    <div>
                      <p>Sale ID: {sale.id}</p>
                      <p>Date: {new Date(sale.date).toLocaleString()}</p>
                      <h3 className="font-bold mt-2">Items:</h3>
                      <ul>
                        {sale.items.map((item, index) => (
                          <li key={index}>
                            {item.name} - Quantity: {item.quantity} - Price: ${item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                      <p className="font-bold mt-2">Total: ${sale.total.toFixed(2)}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}