import GamePlayer from "@/app/_components/GamePlayer";

// Komponen ini tetap async
export default async function PlayGamePage({
    params
}: {
    params: Promise<{ game_code: string }> // Ubah tipe params menjadi Promise
}) {
    // Await params sebelum mengakses propertinya
    const { game_code } = await params;

    // Sekarang bisa menggunakan game_code dengan aman
    return (
        <GamePlayer gameCode={game_code} />
    );
}