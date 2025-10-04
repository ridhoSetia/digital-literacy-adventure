"use client";

import { useState } from 'react';
import { useAuth } from '../_contexts/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { user } = useAuth();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  const openLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  const openRegister = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };

  return (
    <>
      {/* PERUBAHAN: 
        - `container` dan `mx-auto` dihapus dari header.
        - `right-0` ditambahkan untuk memastikan header membentang penuh.
        - Sebuah div baru ditambahkan di dalamnya untuk menjadi container.
      */}
      <header className="bg-indigo-100/30 backdrop-blur-md fixed top-0 left-0 right-0 z-20">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 font-bold text-lg">
              <a href="/" className="flex items-center gap-3">
                <span>Digital Explorer</span>
              </a>
          </div>
          <div className="flex items-center space-x-4">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <button onClick={openLogin} className="text-white/80 hover:text-white font-medium">
                    Login
                  </button>
                  <button onClick={openRegister} className="border-2 border-white/50 rounded-lg px-4 py-1.5 text-white/80 hover:text-white hover:border-white transition-colors">
                    Register
                  </button>
                </>
              )}
            </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onSwitchToRegister={openRegister} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} onSwitchToLogin={openLogin} />
    </>
  );
}