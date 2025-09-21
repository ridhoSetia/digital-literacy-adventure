"use client";

import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
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
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex-shrink-0 flex items-center">
                <Gamepad2 className="text-primary text-2xl mr-2" />
                <span className="font-bold text-xl text-gray-800">Digital Explorer</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <button onClick={openLogin} className="text-gray-600 hover:text-primary font-medium">
                    Login
                  </button>
                  <button onClick={openRegister} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onSwitchToRegister={openRegister} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} onSwitchToLogin={openLogin} />
    </>
  );
}