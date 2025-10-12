"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useAuth } from "@/app/_contexts/AuthContext";
import toast from "react-hot-toast";
import { Plus, Save, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";

// Tipe data
type ScenarioOption = { [key: string]: string };
type Scenario = {
  id?: string;
  situation: string;
  question: string;
  options: ScenarioOption;
  correct_answer: string;
  points: number;
  explanation: string;
  highlight_phrase: string;
  answer_time: number;
  image_url?: string;
};

export default function EditGamePage() {
  const supabase = createClient();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameId = params.game_id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [gameType, setGameType] = useState<"quiz" | "story">("quiz");
  const [scenarios, setScenarios] = useState<Array<Partial<Scenario>>>([]);
  const [originalScenarios, setOriginalScenarios] = useState<
    Array<Partial<Scenario>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchGameData = useCallback(async () => {
    if (!gameId || !user) return;

    setLoading(true);
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("*, scenarios(*)")
      .eq("id", gameId)
      .eq("creator_id", user.id)
      .single();

    if (gameError || !gameData) {
      toast.error("Game tidak ditemukan atau Anda tidak memiliki akses.");
      router.push("/profile");
      return;
    }

    setTitle(gameData.title);
    setDescription(gameData.description || "");
    setGameType(gameData.game_type as "quiz" | "story");
    setCoverImageUrl(gameData.cover_image_url);

    const scenariosData = gameData.scenarios || [];
    // Lakukan deep copy untuk memastikan tidak ada referensi objek yang sama
    setScenarios(JSON.parse(JSON.stringify(scenariosData)));
    setOriginalScenarios(scenariosData);
    setLoading(false);
  }, [gameId, user, supabase, router]);

  useEffect(() => {
    if (user) {
      fetchGameData();
    }
  }, [user, fetchGameData]);

  const handleScenarioChange = (
    index: number,
    field: keyof Scenario,
    value: string | number
  ) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    setScenarios(newScenarios);
  };

  const handleOptionChange = (
    scenarioIndex: number,
    optionKey: string,
    value: string
  ) => {
    const newScenarios = [...scenarios];
    if (!newScenarios[scenarioIndex].options)
      newScenarios[scenarioIndex].options = {};
    newScenarios[scenarioIndex].options![optionKey] = value;
    setScenarios(newScenarios);
  };

  const addScenario = () => {
    setScenarios([
      ...scenarios,
      {
        situation: "",
        options: { A: "", B: "" },
        correct_answer: "A",
        points: 20,
        explanation: "",
        question: "",
        highlight_phrase: "",
        answer_time: 15,
      },
    ]);
  };

  const removeScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.loading("Memeriksa & menyimpan perubahan...");

    // Membersihkan ID dari skenario untuk perbandingan
    const cleanScenarios = scenarios.map(({ id, ...rest }) => rest);
    const cleanOriginalScenarios = originalScenarios.map(
      ({ id, ...rest }) => rest
    );
    const scenariosHaveChanged =
      JSON.stringify(cleanScenarios) !== JSON.stringify(cleanOriginalScenarios);

    // Hitung perubahan jumlah scenarios
    const oldScenarioCount = originalScenarios.length;
    const newScenarioCount = scenarios.length;
    const isAdding = newScenarioCount > oldScenarioCount;

    // Update detail dasar game (judul, deskripsi)
    const { error: gameUpdateError } = await supabase
      .from("games")
      .update({ title, description, game_type: gameType })
      .eq("id", gameId);

    if (gameUpdateError) {
      toast.dismiss();
      toast.error(`Gagal memperbarui detail game: ${gameUpdateError.message}`);
      setIsSaving(false);
      return;
    }

    // Jika skenario berubah
    if (scenariosHaveChanged) {
      // Hapus semua skenario lama
      const { error: deleteError } = await supabase
        .from("scenarios")
        .delete()
        .eq("game_id", gameId);

      if (deleteError) {
        toast.dismiss();
        toast.error(`Gagal menghapus skenario lama: ${deleteError.message}`);
        setIsSaving(false);
        return;
      }

      // Insert skenario baru
      const scenariosToInsert = scenarios.map((s) => {
        const { id, ...rest } = s;
        return { ...rest, game_id: gameId };
      });

      const { error: scenariosError } = await supabase
        .from("scenarios")
        .insert(scenariosToInsert);

      if (scenariosError) {
        toast.dismiss();
        toast.error(`Gagal menyimpan skenario baru: ${scenariosError.message}`);
        setIsSaving(false);
        return;
      }

      // Logika reset progres:
      // - Jika MENAMBAH scenarios: Hanya hapus game_sessions (biarkan scores)
      // - Jika EDIT/HAPUS scenarios: Hapus scores DAN game_sessions (reset total)
      if (isAdding) {
        // Hanya hapus progress (session), biarkan scores untuk bisa lanjut
        await supabase.from("game_sessions").delete().eq("game_id", gameId);
      } else {
        // Hapus semua progres termasuk scores (reset total)
        await supabase.from("scores").delete().eq("game_id", gameId);
        await supabase.from("game_sessions").delete().eq("game_id", gameId);
      }
    }

    toast.dismiss();
    if (scenariosHaveChanged) {
      if (isAdding) {
        toast.success(
          "✨ Game berhasil diperbarui dengan konten baru! Pemain dapat melanjutkan dari konten baru."
        );
      } else {
        toast.success(
          "Game berhasil diperbarui! Progres pemain telah direset."
        );
      }
    } else {
      toast.success("Detail game berhasil diperbarui!");
    }

    router.push("/profile");
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-24">
      <div className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 rounded-xl shadow-lg p-8">
          <h2 className="text-4xl font-bold mb-8 font-display tracking-wider text-center">
            Edit Game
          </h2>
          <form onSubmit={handleUpdateGame} className="space-y-6">
            {coverImageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Gambar Sampul
                </label>
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  width={200}
                  height={150}
                  className="rounded-lg"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Judul Game
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
              ></textarea>
            </div>
            <hr className="border-slate-700" />
            {scenarios.map((scenario, index) => (
              <div
                key={scenario.id || index}
                className="scenario-item bg-slate-800/50 p-6 rounded-lg border border-slate-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Skenario {index + 1}
                  </h3>
                  {scenarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScenario(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {gameType === "story" ? (
                    <>
                      <label className="block text-sm font-medium text-gray-400">
                        Narasi
                      </label>
                      <textarea
                        rows={3}
                        value={scenario.situation || ""}
                        onChange={(e) =>
                          handleScenarioChange(
                            index,
                            "situation",
                            e.target.value
                          )
                        }
                        className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                        required
                      ></textarea>
                      <label className="block text-sm font-medium text-gray-400">
                        Pertanyaan
                      </label>
                      <input
                        type="text"
                        value={scenario.question || ""}
                        onChange={(e) =>
                          handleScenarioChange(
                            index,
                            "question",
                            e.target.value
                          )
                        }
                        className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                        required
                      />
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-400">
                        Pertanyaan Kuis
                      </label>
                      <textarea
                        rows={3}
                        value={scenario.situation || ""}
                        onChange={(e) =>
                          handleScenarioChange(
                            index,
                            "situation",
                            e.target.value
                          )
                        }
                        className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                        required
                      ></textarea>
                    </>
                  )}
                  <div className="flex flex-col md:flex-row gap-4">
                    {["A", "B", "C", "D"].map((optionKey) => (
                      <div key={optionKey}>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Pilihan {optionKey}
                        </label>
                        <input
                          type="text"
                          value={scenario.options?.[optionKey] || ""}
                          onChange={(e) =>
                            handleOptionChange(index, optionKey, e.target.value)
                          }
                          className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Jawaban Benar
                      </label>
                      <select
                        value={scenario.correct_answer}
                        onChange={(e) =>
                          handleScenarioChange(
                            index,
                            "correct_answer",
                            e.target.value
                          )
                        }
                        className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                        required
                      >
                        {Object.keys(scenario.options || {})
                          .filter((key) => scenario.options?.[key])
                          .map((key) => (
                            <option key={key} value={key}>
                              Pilihan {key}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Poin
                      </label>
                      <input
                        type="number"
                        value={scenario.points || 20}
                        onChange={(e) =>
                          handleScenarioChange(
                            index,
                            "points",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-400">
                    Penjelasan
                  </label>
                  <textarea
                    value={scenario.explanation || ""}
                    onChange={(e) =>
                      handleScenarioChange(index, "explanation", e.target.value)
                    }
                    className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg"
                  ></textarea>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addScenario}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Tambah Skenario
            </button>
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="px-6 py-3 border border-slate-600 rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition flex items-center gap-2 disabled:bg-slate-600"
              >
                <Save size={18} />{" "}
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
``;
