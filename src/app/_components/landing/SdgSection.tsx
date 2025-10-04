export default function SdgSection() {
    return (
        <section className="py-16 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 font-display tracking-wider">Mendukung SDGs</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Card 1 */}
                    <div className="w-full flex-1 flex-grow items-center bg-indigo-950 border border-indigo-800 p-6 rounded-xl shadow-md text-center">
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl font-pixel shadow-lg">4</div>
                        <h3 className="flex-shrink-0 font-semibold mb-2 font-pixel text-base">Quality Education</h3>
                        <p className="text-gray-400 text-sm">Pendidikan literasi digital berkualitas untuk semua</p>
                    </div>
                    {/* Card 2 */}
                    <div className="w-full flex-1 flex-grow items-center bg-indigo-950 border border-indigo-800 p-6 rounded-xl shadow-md text-center">
                        <div className="flex-shrink-0 w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl font-pixel shadow-lg">9</div>
                        <h3 className="flex-shrink-0 font-semibold mb-2 font-pixel text-base">Innovation</h3>
                        <p className="text-gray-400 text-sm">Platform inovatif untuk pembelajaran digital</p>
                    </div>
                    {/* Card 3 */}
                    <div className="w-full flex-1 flex-grow items-center bg-indigo-950 border border-indigo-800 p-6 rounded-xl shadow-md text-center">
                        <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl font-pixel shadow-lg">17</div>
                        <h3 className="flex-shrink-0 font-semibold mb-2 font-pixel text-base">Partnerships</h3>
                        <p className="text-gray-400 text-sm">Kolaborasi melalui sharing game antar siswa</p>
                    </div>
                </div>
            </div>
        </section>
    );
}