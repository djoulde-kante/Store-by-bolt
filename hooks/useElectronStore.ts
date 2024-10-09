import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Sale {
  id: string;
  date: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
}

export function useElectronStore() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkElectron = () => {
      if (window.electron) {
        setIsReady(true);
      } else {
        setTimeout(checkElectron, 10);
      }
    };
    checkElectron();
  }, []);

  const getProducts = async (): Promise<Product[]> => {
    if (!isReady) return [];
    return await window.electron.getProducts();
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
    if (!isReady) return;
    await window.electron.addProduct(product);
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    if (!isReady) return;
    await window.electron.updateProduct(id, updates);
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!isReady) return;
    await window.electron.deleteProduct(id);
  };

  const getSales = async (): Promise<Sale[]> => {
    if (!isReady) return [];
    return await window.electron.getSales();
  };

  const addSale = async (sale: Omit<Sale, 'id'>): Promise<void> => {
    if (!isReady) return;
    await window.electron.addSale(sale);
  };

  return {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getSales,
    addSale,
  };
}