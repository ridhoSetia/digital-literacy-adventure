import './globals.css';
import { Inter, Bebas_Neue, Press_Start_2P } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './_contexts/AuthContext';
import Navbar from './_components/Navbar';
import Footer from './_components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas-neue' });
const pressStart2P = Press_Start_2P({ subsets: ['latin'], weight: '400', variable: '--font-press-start-2p' });

export const metadata = {
  title: 'Digital Literacy Adventure',
  description: 'Jelajahi dunia digital dengan aman! Belajar literasi digital melalui game interaktif yang seru.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml"></link>
      </head>
      <body className={`${inter.variable} ${bebasNeue.variable} ${pressStart2P.variable} font-sans text-white bg-indigo-950`}>
        <AuthProvider>
          <Navbar />
          {/* Tag <main> dipindahkan ke komponen halaman masing-masing jika diperlukan */}
          {children}
           <Footer />
          <Toaster position="top-center" reverseOrder={false} />
        </AuthProvider>
      </body>
    </html>
  );
}