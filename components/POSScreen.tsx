"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useElectronStore } from '@/hooks/useElectronStore';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const { toast } = useToast();
  const { getProducts, updateProduct, addSale } = useElectronStore();

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    };
    fetchProducts();
  }, [getProducts]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
    ));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      toast({
        title: "Product not found",
        description: "No product matches the entered barcode.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    try {
      // Update product stock
      for (const item of cart) {
        await updateProduct(item.id, { stock: item.stock - item.quantity });
      }

      // Add sale record
      await addSale({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      });

      // Clear cart
      setCart([]);

      toast({
        title: "Checkout successful",
        description: "The sale has been recorded and stock updated.",
      });

      // Generate and print receipt
      const receiptContent = generateReceipt(cart);
      await window.electron.printReceipt(receiptContent);

    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateReceipt = (items: CartItem[]): string => {
    let receipt = "Grocery Store Receipt\n\n";
    receipt += "Date: " + new Date().toLocaleString() + "\n\n";
    receipt += "Items:\n";
    items.forEach(item => {
      receipt += `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    receipt += "\nTotal: $" + items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    return receipt;
  };

  return (
    <div className="flex">
      <div className="w-2/3 pr-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <form onSubmit={handleBarcodeSubmit} className="mb-4">
          <Input
            type="text"
            placeholder="Scan barcode..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
          />
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Button onClick={() => addToCart(product)} disabled={product.stock === 0}>
                    Add to Cart
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="w-1/3 pl-4">
        <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
        {cart.map(item => (
          <div key={item.id} className="flex justify-between items-center mb-2">
            <span>{item.name}</span>
            <div>
              <Button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
              <span className="mx-2">{item.quantity}</span>
              <Button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
              <Button onClick={() => removeFromCart(item.id)} variant="destructive" className="ml-2">Remove</Button>
            </div>
          </div>
        ))}
        <div className="mt-4">
          <strong>Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong>
        </div>
        <Button onClick={handleCheckout} className="mt-4" disabled={cart.length === 0}>Checkout</Button>
      </div>
    </div>
  );
}