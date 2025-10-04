"use client";

import { useState } from 'react';
import { useAuth } from '../_contexts/AuthContext';
import { User, LogOut, UserCircle } from 'lucide-react'; // <-- Tambahkan UserCircle
import toast from 'react-hot-toast';
import Link from 'next/link'; // <-- Tambahkan import Link

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false); // Tutup menu setelah logout
    toast.success("Anda berhasil logout.");
  };

  if (!user) return null; // Jika user belum ter-load, jangan render apa-apa

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-md  rounded-lg shadow-lg border-indigo-400 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-indigo-950 border-gray-400 border-b">
              <p className="font-semibold truncate">{user?.email}</p>
            </div>
            
            {/* --- TAUTAN PROFIL BARU DITAMBAHKAN DI SINI --- */}
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)} // Tutup menu saat link diklik
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <UserCircle size={16} />
              <span>Profil Saya</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}