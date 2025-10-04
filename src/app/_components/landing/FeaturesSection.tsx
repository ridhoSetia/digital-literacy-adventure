import { ShieldCheck, Users, Search } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section className="py-20 relative bg-indigo-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="font-display text-4xl font-bold tracking-wider mb-12 text-white drop-shadow-lg">Fitur Unggulan</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Card 1 */}
                    <div className="w-full flex-1 flex-grow bg-slate-900/70 backdrop-blur-sm border border-violet-700 p-8 rounded-xl shadow-lg hover:shadow-violet-500/50 hover:-translate-y-2 transition-all duration-300">
                        <ShieldCheck className="flex-shrink-0 text-5xl text-green-400 mb-4 mx-auto" />
                        <h3 className="flex-shrink-0 text-lg font-bold font-pixel mb-3 text-gray-100">Keamanan Digital</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Pelajari cara melindungi diri dari phishing, malware, dan ancaman digital lainnya.</p>
                    </div>
                    {/* Card 2 */}
                    <div className="w-full flex-1 flex-grow bg-slate-900/70 backdrop-blur-sm border border-violet-700 p-8 rounded-xl shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-2 transition-all duration-300">
                        <Users className="flex-shrink-0 text-5xl text-cyan-400 mb-4 mx-auto" />
                        <h3 className="flex-shrink-0 text-lg font-bold font-pixel mb-3 text-gray-100">Etika Digital</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Memahami cara berinteraksi yang baik dan bertanggung jawab di dunia maya.</p>
                    </div>
                    {/* Card 3 */}
                    <div className="w-full flex-1 flex-grow bg-slate-900/70 backdrop-blur-sm border border-violet-700 p-8 rounded-xl shadow-lg hover:shadow-yellow-500/50 hover:-translate-y-2 transition-all duration-300">
                        <Search className="flex-shrink-0 text-5xl text-yellow-400 mb-4 mx-auto" />
                        <h3 className="flex-shrink-0 text-lg font-bold font-pixel mb-3 text-gray-100">Fact Checking</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Kemampuan memverifikasi informasi dan membedakan fakta dari hoaks.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}