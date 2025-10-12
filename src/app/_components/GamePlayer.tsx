"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import toast from "react-hot-toast";
import { useAuth } from "@/app/_contexts/AuthContext";
import { ArrowRight, Loader2, ShieldOff, RotateCcw } from "lucide-react";
import Image from "next/image";
import { usePreloadedSounds } from "../_hooks/usePreloadedSounds";

// --- Tipe Data ---
type Scenario = {
  id: string;
  situation: string;
  question: string | null;
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string;
  points: number;
  highlight_phrase: string | null;
  answer_time: number;
  image_url: string | null;
};
type Game = {
  id: string;
  title: string;
  game_type: "quiz" | "story";
  scenarios: Scenario[];
};

// --- Komponen Tambahan (Tidak Berubah) ---
const Timer = ({
  duration,
  onTimeUp,
}: {
  duration: number;
  onTimeUp: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const intervalId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);
  return (
    <div className="font-pixel text-lg font-semibold text-yellow-400">
      Waktu: {timeLeft}s
    </div>
  );
};

const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string | null;
}) => {
  if (!highlight || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-400 text-black px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

// --- Komponen Utama Game Player ---
export default function GamePlayer({
  gameCode,
  isReviewMode = false,
}: {
  gameCode: string;
  isReviewMode?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();

  // 1. Definisikan semua file audio yang akan digunakan.
  const soundFiles = [
    "/sounds/click.wav",
    "/sounds/correct.wav",
    "/sounds/incorrect.wav",
    "/sounds/gameover.wav",
    "/sounds/win.wav",
  ];
  // 2. Gunakan hook baru untuk mendapatkan fungsi playSound yang sudah dioptimalkan.
  const playSound = usePreloadedSounds(soundFiles);
  // ▲▲▲ AKHIR PERUBAHAN UTAMA ▲▲▲

  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null);

  const [game, setGame] = useState<Game | null>(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState<
    "reading" | "answering" | "feedback"
  >("reading");
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isRetryMode, setIsRetryMode] = useState(false);

  const currentScenario = game?.scenarios[currentScenarioIndex];

  useEffect(() => {
    if (isReviewMode || !sessionLoaded) return;

    const audio = new Audio("/sounds/background.wav");
    audio.loop = true;
    audio.volume = 0.8;
    audio.play().catch((e) => console.error("Gagal memutar musik latar:", e));
    setBgMusic(audio);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [isReviewMode, sessionLoaded]);

  const saveProgress = useCallback(
    async (indexToSave: number, scoreToSave: number, hpToSave: number) => {
      if (!user || !game || isReviewMode || isGameFinished || isRetryMode)
        return; // Jangan simpan progres jika mode coba lagi

      try {
        await supabase.from("game_sessions").upsert(
          {
            user_id: user.id,
            game_id: game.id,
            current_scenario_index: indexToSave,
            score: scoreToSave,
            hp: hpToSave,
          },
          { onConflict: "user_id, game_id" }
        );
      } catch (err) {
        console.error("Exception saving progress:", err);
      }
    },
    [user, game, isReviewMode, isGameFinished, supabase, isRetryMode]
  );

  const endGame = useCallback(
    async (isGameOver = false) => {
      if (bgMusic) {
        bgMusic.pause();
      }
      if (!isReviewMode) {
        isGameOver
          ? playSound("/sounds/gameover.wav")
          : playSound("/sounds/win.wav");
      }

      setIsGameFinished(true);
      if (isReviewMode || isRetryMode) {
        // Jangan simpan skor jika mode coba lagi
        if (!isGameOver) toast.success("Game Selesai!");
        return;
      }

      if (!user || !game) return;
      toast.loading("Menyimpan hasil...");

      await supabase
        .from("game_sessions")
        .delete()
        .match({ user_id: user.id, game_id: game.id });

      if (!isGameOver) {
        const totalScenarios = game.scenarios.length;
        const { data: existingScore } = await supabase
          .from("scores")
          .select("id, score_achieved")
          .eq("user_id", user.id)
          .eq("game_id", game.id)
          .single();

        if (existingScore) {
          const { error: scoreError } = await supabase.rpc("update_score", {
            score_id_input: existingScore.id,
            new_score_input: score,
            new_scenario_count_input: totalScenarios,
          });

          if (scoreError) {
            toast.dismiss();
            toast.error("Gagal menyimpan hasil.");
            return;
          }

          const newXp = score - existingScore.score_achieved;
          const { error: rpcError } = await supabase.rpc("increment_xp", {
            user_id_input: user.id,
            xp_to_add: newXp > 0 ? newXp : 0,
          });

          toast.dismiss();
          if (rpcError) {
            toast.error("Gagal memperbarui XP.");
          } else {
            toast.success("Konten baru selesai!");
            router.push(`/result/${existingScore.id}`);
          }
        } else {
          const { data: scoreData, error: scoreError } = await supabase
            .from("scores")
            .insert({
              user_id: user.id,
              game_id: game.id,
              score_achieved: score,
              scenario_count: totalScenarios,
            })
            .select("id")
            .single();

          if (scoreError) {
            toast.dismiss();
            toast.error("Gagal menyimpan sesi permainan.");
            return;
          }

          await supabase.rpc("increment_play_count", {
            game_id_input: game.id,
          });
          const { error: rpcError } = await supabase.rpc("increment_xp", {
            user_id_input: user.id,
            xp_to_add: score,
          });

          toast.dismiss();
          if (rpcError) {
            toast.error("Gagal memperbarui total XP Anda.");
          } else {
            toast.success("Game Selesai!");
            router.push(`/result/${scoreData.id}`);
          }
        }
      } else {
        toast.dismiss();
      }
    },
    [
      isReviewMode,
      user,
      game,
      score,
      supabase,
      router,
      bgMusic,
      playSound,
      isRetryMode,
    ]
  );

  useEffect(() => {
    const fetchGameAndSession = async () => {
      if (!gameCode) return;
      setIsLoading(true);

      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select(`*, scenarios (*)`)
        .eq("game_code", gameCode)
        .single();

      if (gameError || !gameData) {
        toast.error("Game tidak ditemukan!");
        if (!isReviewMode) router.push("/game");
        return;
      }

      if (!isReviewMode && user) {
        const { data: sessionData } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("game_id", gameData.id)
          .single();

        if (sessionData) {
          setCurrentScenarioIndex(sessionData.current_scenario_index);
          setScore(sessionData.score);
          setHp(sessionData.hp);
          setNotification("Melanjutkan permainan...");
        } else {
          const { data: scoreData } = await supabase
            .from("scores")
            .select("id, scenario_count, score_achieved")
            .eq("user_id", user.id)
            .eq("game_id", gameData.id)
            .single();

          if (scoreData && scoreData.scenario_count > 0) {
            const completedCount = scoreData.scenario_count;
            const totalCount = gameData.scenarios.length;
            if (totalCount > completedCount) {
              setCurrentScenarioIndex(completedCount);
              setScore(scoreData.score_achieved);
              setNotification(
                `Konten baru tersedia! Melanjutkan dari skenario ${
                  completedCount + 1
                }`
              );
            }
          }
        }
      }

      setGame(gameData as Game);
      if (gameData.game_type === "quiz") setViewState("answering");
      setIsLoading(false);
      setSessionLoaded(true);
    };

    if (isReviewMode || user) {
      fetchGameAndSession();
    } else if (user === null && !isReviewMode) {
      toast.error("Anda harus login untuk bermain.");
      router.push("/");
    }
  }, [gameCode, user, router, supabase, isReviewMode]);

  useEffect(() => {
    if (notification) {
      toast.success(notification, { duration: 4000 });
      setNotification(null);
    }
  }, [notification]);

  useEffect(() => {
    if (hp <= 0 && !isGameFinished && !isReviewMode) {
      endGame(true);
    }
  }, [hp, isGameFinished, isReviewMode, endGame]);

  useEffect(() => {
    if (!sessionLoaded || isLoading || !game) return;
    const indexToSave = isAnswered
      ? currentScenarioIndex + 1
      : currentScenarioIndex;
    if (indexToSave < game.scenarios.length) {
      saveProgress(indexToSave, score, hp);
    }
  }, [
    isAnswered,
    currentScenarioIndex,
    score,
    hp,
    sessionLoaded,
    isLoading,
    game,
    saveProgress,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isGameFinished && game) {
        const indexToSave = isAnswered
          ? currentScenarioIndex + 1
          : currentScenarioIndex;
        if (indexToSave < game.scenarios.length) {
          saveProgress(indexToSave, score, hp);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    saveProgress,
    isGameFinished,
    isAnswered,
    currentScenarioIndex,
    score,
    hp,
    game,
  ]);

  // ▼▼▼ FUNGSI `handleAnswer` DIPERBARUI ▼▼▼
  const handleAnswer = useCallback(
    (optionKey: string | null) => {
      if (isAnswered || !currentScenario) return;
      if (game?.game_type === "story") setViewState("feedback");
      if (isReviewMode) {
        setSelectedOption(optionKey);
        setIsAnswered(true);
        return;
      }

      const points = currentScenario.points || 0;
      if (optionKey === currentScenario.correct_answer) {
        playSound("/sounds/correct.wav");

        // Cek apakah mode coba lagi aktif, jika iya, berikan 10% poin
        const pointsToAdd = isRetryMode ? Math.floor(points * 0.1) : points;

        setScore((prev) => prev + pointsToAdd);
        toast.success(`Benar! +${pointsToAdd} XP`, { icon: "✅" });
      } else {
        playSound("/sounds/incorrect.wav");
        setHp((prev) => Math.max(0, prev - 20));
        toast.error(
          optionKey ? "Kurang Tepat! -20 HP" : "Waktu Habis! -20 HP",
          { icon: "❌" }
        );
      }
      setSelectedOption(optionKey);
      setIsAnswered(true);
    },
    [
      isAnswered,
      currentScenario,
      game?.game_type,
      isReviewMode,
      playSound,
      isRetryMode,
    ] // <-- Tambahkan isRetryMode
  );

  const nextStep = () => {
    if (currentScenarioIndex < game!.scenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      if (game?.game_type === "story") setViewState("reading");
    } else {
      endGame(false);
    }
  };

  // ▼▼▼ FUNGSI BARU UNTUK MERESTART GAME ▼▼▼
  const restartGame = () => {
    setHp(100);
    setScore(0);
    setCurrentScenarioIndex(0);
    setIsGameFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setViewState(game?.game_type === "quiz" ? "answering" : "reading");
    setIsRetryMode(true); // Aktifkan mode coba lagi
    toast.success("Coba lagi! Kamu akan mendapat 10% XP.", { icon: "💪" });

    if (bgMusic) {
      bgMusic.currentTime = 0;
      bgMusic
        .play()
        .catch((e) => console.error("Gagal memulai ulang musik:", e));
    }
  };

  // ▼▼▼ TAMPILAN GAME OVER DIPERBARUI ▼▼▼
  if (hp <= 0 && !isReviewMode) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white flex-col p-4">
        <ShieldOff className="w-24 h-24 text-red-500 mb-4" />
        <h1 className="text-5xl font-bold font-pixel text-red-500 text-center">
          GAME OVER
        </h1>
        <p className="text-gray-400 mt-4 text-center">Anda kehabisan HP.</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => {
              playSound("/sounds/click.wav", 1);
              router.push("/game");
            }}
            className="bg-violet-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-violet-700 transition"
          >
            Kembali ke Daftar Game
          </button>
          <button
            onClick={() => {
              playSound("/sounds/click.wav", 1);
              restartGame();
            }}
            className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Coba Lagi (10% XP)
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !currentScenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-violet-400" />
      </div>
    );
  }

  const progress = ((currentScenarioIndex + 1) / game!.scenarios.length) * 100;

  const QuizView = () => (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 p-8 rounded-lg shadow-lg">
      {currentScenario.image_url && (
        <div className="relative w-full h-56 mb-6 rounded-lg overflow-hidden border-2 border-slate-700">
          <Image
            src={currentScenario.image_url}
            alt="Gambar Skenario"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4 font-display tracking-wider">
        {currentScenario.situation}
      </h2>
      <div className="space-y-3">
        {Object.entries(currentScenario.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              playSound("/sounds/click.wav", 1);
              handleAnswer(key);
            }}
            disabled={isAnswered || isGameFinished}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 
                ${
                  isAnswered && key === currentScenario.correct_answer
                    ? "bg-green-900/50 border-green-500"
                    : ""
                } 
                ${
                  isAnswered &&
                  key === selectedOption &&
                  key !== currentScenario.correct_answer
                    ? "bg-red-900/50 border-red-500"
                    : ""
                } 
                ${
                  !isAnswered
                    ? "bg-slate-800/50 border-slate-700 hover:bg-violet-900/50 hover:border-violet-600"
                    : "border-slate-700"
                }`}
          >
            {value}
          </button>
        ))}
      </div>
      {isAnswered && (
        <div className="mt-6 animate-fade-in">
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h3 className="font-bold font-display tracking-wide text-yellow-400">
              Penjelasan:
            </h3>
            <p className="text-gray-300">{currentScenario.explanation}</p>
          </div>
          <button
            onClick={() => {
              playSound("/sounds/click.wav", 1);
              nextStep();
            }}
            disabled={isGameFinished}
            className="w-full mt-4 bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition flex items-center justify-center gap-2 disabled:bg-slate-600"
          >
            {currentScenarioIndex < game!.scenarios.length - 1
              ? "Lanjut ke Pertanyaan Berikutnya"
              : "Lihat Hasil Akhir"}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );

  const StoryView = () => (
    <>
      {viewState !== "answering" && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 p-8 rounded-lg shadow-lg mb-6">
          {currentScenario.image_url && (
            <div className="relative w-full h-56 mb-6 rounded-lg overflow-hidden border-2 border-slate-700">
              <Image
                src={currentScenario.image_url}
                alt="Gambar Narasi"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <p className="text-lg leading-relaxed text-gray-300">
            <HighlightedText
              text={currentScenario.situation}
              highlight={
                viewState === "feedback"
                  ? currentScenario.highlight_phrase
                  : null
              }
            />
          </p>
        </div>
      )}
      {viewState === "reading" && (
        <button
          onClick={() => {
            playSound("/sounds/click.wav", 1);
            setViewState("answering");
          }}
          disabled={isGameFinished}
          className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition disabled:bg-slate-600"
        >
          Lanjut untuk Menjawab
        </button>
      )}
      {viewState === "answering" && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 font-display tracking-wider">
            {currentScenario.question}
          </h2>
          <div className="space-y-3">
            {Object.entries(currentScenario.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  playSound("/sounds/click.wav", 1);
                  handleAnswer(key);
                }}
                disabled={isGameFinished}
                className="w-full text-left p-4 rounded-lg border-2 bg-slate-800/50 border-slate-700 hover:bg-violet-900/50 hover:border-violet-600 transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
      {viewState === "feedback" && (
        <div>
          <div
            className={`p-4 rounded-lg mb-4 text-center font-bold font-pixel text-lg ${
              selectedOption === currentScenario.correct_answer
                ? "bg-green-900/50 text-green-300"
                : "bg-red-900/50 text-red-300"
            }`}
          >
            {selectedOption === currentScenario.correct_answer
              ? "Jawaban Benar!"
              : selectedOption === null
              ? "Waktu Habis!"
              : "Jawaban Kurang Tepat!"}
          </div>
          <p className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg mb-4 text-gray-300">
            <b>Penjelasan:</b> {currentScenario.explanation}
          </p>
          <button
            onClick={() => {
              playSound("/sounds/click.wav", 1);
              nextStep();
            }}
            disabled={isGameFinished}
            className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition disabled:bg-slate-600"
          >
            {currentScenarioIndex < game!.scenarios.length - 1
              ? "Lanjut ke Skenario Berikutnya"
              : "Lihat Hasil Akhir"}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24 min-h-screen">
      {!isReviewMode && (
        <>
          <div className="flex justify-between items-center mb-4 text-gray-300">
            <div className="font-pixel">HP: {hp}/100</div>
            {game!.game_type === "story" &&
              viewState === "answering" &&
              !isAnswered && (
                <Timer
                  duration={currentScenario.answer_time || 15}
                  onTimeUp={() => handleAnswer(null)}
                />
              )}
            <div className="font-pixel">Skor: {score} XP</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 mb-8">
            <div
              className="bg-violet-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </>
      )}
      {game!.game_type === "quiz" ? <QuizView /> : <StoryView />}
    </div>
  );
}
