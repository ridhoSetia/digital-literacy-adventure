import { ShieldCheck, Users, Search } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card-hover bg-white p-8 rounded-xl shadow-lg text-center">
                        <ShieldCheck className="text-4xl text-primary mb-4 mx-auto" />
                        <h3 className="text-xl font-semibold mb-3">Keamanan Digital</h3>
                        <p className="text-gray-600">Pelajari cara melindungi diri dari phishing, malware, dan ancaman digital lainnya.</p>
                    </div>
                    <div className="card-hover bg-white p-8 rounded-xl shadow-lg text-center">
                        <Users className="text-4xl text-success mb-4 mx-auto" />
                        <h3 className="text-xl font-semibold mb-3">Etika Digital</h3>
                        <p className="text-gray-600">Memahami cara berinteraksi yang baik dan bertanggung jawab di dunia maya.</p>
                    </div>
                    <div className="card-hover bg-white p-8 rounded-xl shadow-lg text-center">
                        <Search className="text-4xl text-accent mb-4 mx-auto" />
                        <h3 className="text-xl font-semibold mb-3">Fact Checking</h3>
                        <p className="text-gray-600">Kemampuan memverifikasi informasi dan membedakan fakta dari hoaks.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}