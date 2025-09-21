export default function SdgSection() {
    return (
        <section className="bg-gray-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">Mendukung SDGs</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">4</div>
                        <h3 className="font-semibold mb-2">Quality Education</h3>
                        <p className="text-gray-600 text-sm">Pendidikan literasi digital berkualitas untuk semua</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">9</div>
                        <h3 className="font-semibold mb-2">Innovation</h3>
                        <p className="text-gray-600 text-sm">Platform inovatif untuk pembelajaran digital</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">17</div>
                        <h3 className="font-semibold mb-2">Partnerships</h3>
                        <p className="text-gray-600 text-sm">Kolaborasi melalui sharing game antar siswa</p>
                    </div>
                </div>
            </div>
        </section>
    );
}