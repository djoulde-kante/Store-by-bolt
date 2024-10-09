"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import POSScreen from '@/components/POSScreen';
import DashboardScreen from '@/components/DashboardScreen';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'pos' | 'dashboard'>('pos');
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-4 flex justify-between items-center">
        <div>
          <Button
            variant={currentScreen === 'pos' ? 'default' : 'outline'}
            onClick={() => setCurrentScreen('pos')}
            className="mr-2"
          >
            Point of Sale
          </Button>
          <Button
            variant={currentScreen === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentScreen('dashboard')}
            className="mr-2"
          >
            Dashboard
          </Button>
          <Link href="/products" passHref>
            <Button variant="outline" className="mr-2">Products</Button>
          </Link>
          <Link href="/sales" passHref>
            <Button variant="outline" className="mr-2">Sales</Button>
          </Link>
          <Link href="/reports" passHref>
            <Button variant="outline">Reports</Button>
          </Link>
        </div>
        <div>
          <span className="mr-4">Welcome, {user.name}</span>
          <Button onClick={logout}>Logout</Button>
        </div>
      </nav>

      {currentScreen === 'pos' && <POSScreen />}
      {currentScreen === 'dashboard' && <DashboardScreen />}
    </div>
  );
}