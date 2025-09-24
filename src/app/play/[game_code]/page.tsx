import GamePlayer from "@/app/_components/GamePlayer";

export default function PlayGamePage({ params }: { params: { game_code: string } }) {
    // Halaman ini hanya bertugas mengambil game_code dari URL
    // dan memberikannya ke komponen GamePlayer.
    return (
        <GamePlayer gameCode={params.game_code} />
    );
}