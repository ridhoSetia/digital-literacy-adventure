"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';
import { KeyRound, X } from 'lucide-react';

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
      toast.success('Login berhasil!');
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
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-violet-700 rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl shadow-violet-500/20 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center font-display tracking-wider">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" required />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition disabled:bg-slate-600">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4">
            <button onClick={handleGoogleLogin} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                <KeyRound size={20} /> Login dengan Google
            </button>
        </div>
        <div className="mt-6 text-center">
          <button onClick={onSwitchToRegister} className="text-violet-400 hover:underline">
            Belum punya akun? Daftar
          </button>
        </div>
      </div>
    </div>
  );
}