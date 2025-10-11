import Link from "next/link";
import Image from "next/image";


export default function Footer() {
  return (
    <footer className="relative z-10 bg-slate-900/50 backdrop-blur-sm border-t border-violet-700 mt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Bagian Kiri: Logo dan Copyright */}
          <div className="text-center md:text-left mb-6 md:mb-0">
            <Link
              href="/"
              className="flex items-center justify-center md:justify-start gap-3 font-bold text-lg mb-2"
            >
              <Image
                src="/logo.svg"
                alt="Digital Explorer Logo"
                width={128}
                height={128}
                className="h-8 w-auto drop-shadow-lg"
              />
              <span className="font-display tracking-wider text-xl">
                Navigasi Literasi
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Dibuat dengan semangat literasi.
            </p>
          </div>

          {/* Bagian Kanan: Link dan Media Sosial */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <nav className="flex gap-6 font-semibold text-gray-300">
              <Link
                href="/game"
                className="hover:text-violet-400 transition-colors"
              >
                Game
              </Link>
              <Link
                href="/leaderboard"
                className="hover:text-violet-400 transition-colors"
              >
                Peringkat
              </Link>
              <Link
                href="/profile"
                className="hover:text-violet-400 transition-colors"
              >
                Profil
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
