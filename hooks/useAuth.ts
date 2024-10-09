import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'cashier';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    // In a real application, you would validate credentials against a backend
    if (username === 'admin' && password === 'password') {
      const user: User = { id: '1', name: 'Admin', role: 'admin' };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } else if (username === 'cashier' && password === 'password') {
      const user: User = { id: '2', name: 'Cashier', role: 'cashier' };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  return { user, login, logout };
}