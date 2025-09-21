"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react'; // Perbaikan ikon

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login successful!');
      onClose();
    }
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${location.origin}/auth/callback`
        }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* ... input fields untuk email & password ... */}
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:bg-gray-400">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4">
            <button onClick={handleGoogleLogin} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2">
                <KeyRound size={20} /> Login dengan Google
            </button>
        </div>
        <div className="mt-4 text-center">
          <button onClick={onSwitchToRegister} className="text-primary hover:underline">
            Belum punya akun? Daftar
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
      </div>
    </div>
  );
}