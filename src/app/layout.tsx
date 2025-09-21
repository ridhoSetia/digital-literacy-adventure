import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './_contexts/AuthContext';
import Navbar from './_components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Digital Literacy Adventure',
  description: 'Jelajahi dunia digital dengan aman! Belajar literasi digital melalui game interaktif yang seru.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-center" reverseOrder={false} />
        </AuthProvider>
      </body>
    </html>
  );
}