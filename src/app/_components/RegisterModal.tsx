"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react'; // Perbaikan ikon

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // Kirim nama ke metadata user
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
      onClose();
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
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
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
            </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:bg-gray-400">
            {loading ? 'Mendaftarkan...' : 'Register'}
          </button>
        </form>
         <div className="mt-4">
            <button onClick={handleGoogleRegister} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2">
                <KeyRound size={20} /> Daftar dengan Google
            </button>
        </div>
        <div className="mt-4 text-center">
          <button onClick={onSwitchToLogin} className="text-primary hover:underline">
            Sudah punya akun? Login
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
    </div>
  );
}