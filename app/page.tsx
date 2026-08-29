"use client";

import { useState, useEffect, useRef } from "react";
import { LoaderCircle, RefreshCw, Search, Volume2, VolumeX } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface StoryStep {
  storyText: string;
  imagePrompt: string;
  options: Option[];
}

export default function InteractiveStoryPage() {
  const [currentStep, setCurrentStep] = useState<StoryStep | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Ses Durumu Yönetimi
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startNewStory();
  }, []);

  // Metni kod tarafında kesen fonksiyon (Varsayılan: İlk 2 Cümle)
  const truncateStory = (text: string, sentenceCount: number = 2) => {
    if (!text) return "";
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, sentenceCount).join(" ");
  };

  // ElevenLabs TTS Entegrasyonu
  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak) return;

    // Eğer çalan eski bir ses varsa durdur
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsSpeaking(true);
    setAudioError(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Ses üretilemedi.");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err: any) {
      console.error("Audio playback error:", err);
      setAudioError(err.message);
      setIsSpeaking(false);
    }
  };

  const updateImage = (prompt: string) => {
    const cleanPrompt = encodeURIComponent(`dark detective cinematic, ${prompt || "detective case"}`);
    const seed = Math.floor(Math.random() * 9999);
    setImageUrl(`https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=450&nologo=true&seed=${seed}`);
  };

  const startNewStory = async () => {
    setLoading(true);
    setHistory([]);
    setImageUrl(null);
    setAudioError(null);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [], chosenOption: null }),
      });
      const data: StoryStep = await res.json();
      setCurrentStep(data);
      setHistory([data.storyText]);

      if (data.imagePrompt) updateImage(data.imagePrompt);

      // Metni kesip seslendir
      const truncated = truncateStory(data.storyText, 2);
      speakText(truncated);
    } catch (err) {
      console.error("Story error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (option: Option) => {
    if (loading || !currentStep) return;

    setLoading(true);
    setAudioError(null);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsSpeaking(false);
    }

    const newHistory = [...history, `Seçim: ${option.id} - ${option.text}`];

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          chosenOption: option.text,
        }),
      });

      const data: StoryStep = await res.json();
      setCurrentStep(data);
      setHistory([...newHistory, data.storyText]);

      if (data.imagePrompt) updateImage(data.imagePrompt);

      // Yeni adımı seslendir
      const truncated = truncateStory(data.storyText, 2);
      speakText(truncated);
    } catch (err) {
      console.error("Story update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-red-500 font-bold tracking-wider text-sm">
            <Search className="w-4 h-4" />
            <span>WHODUNNİT</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dinleme / Tekrar Oynatma Butonu */}
            {currentStep?.storyText && (
              <button
                onClick={() => speakText(truncateStory(currentStep.storyText, 2))}
                disabled={isSpeaking || loading}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                  isSpeaking
                    ? "bg-red-950/50 border-red-800 text-red-400 animate-pulse"
                    : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300"
                }`}
                title="Hikayeyi Seslendir"
              >
                {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Okunuyor..." : "Oku"}</span>
              </button>
            )}

            <button
              onClick={startNewStory}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-neutral-300 transition flex items-center gap-1.5 border border-neutral-700"
            >
              <RefreshCw className="w-3 h-3" /> Yeniden Başlat
            </button>
          </div>
        </header>

        {loading ? (
          <div className="min-h-[260px] flex flex-col items-center justify-center gap-2 text-neutral-400">
            <LoaderCircle className="w-7 h-7 animate-spin text-red-600" />
            <p className="text-xs">Yeni Durum Yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* Görsel Alanı */}
            <div className="relative w-full aspect-[16/9] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Scene"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-neutral-600 text-xs">Görsel Yükleniyor...</div>
              )}
            </div>

            {/* Kod ile 2 cümleye kesilmiş kısa metin */}
            <div className="bg-neutral-950 border border-neutral-800/80 p-4 rounded-xl text-neutral-200 text-sm leading-snug font-medium relative">
              {currentStep?.storyText ? truncateStory(currentStep.storyText, 2) : ""}
            </div>

            {/* Ses Hatası Varsa Göster */}
            {audioError && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-2 rounded-lg">
                Ses Hatası: {audioError}
              </div>
            )}

            {/* Seçenekler */}
            <div className="flex flex-col gap-2.5">
              {currentStep?.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left bg-neutral-950 hover:bg-red-950/20 border border-neutral-800 hover:border-red-600/50 p-3 rounded-xl text-xs md:text-sm transition flex items-center gap-3 group"
                >
                  <span className="bg-red-950 text-red-500 border border-red-800/60 font-mono font-bold w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition">
                    {option.id}
                  </span>
                  <span className="text-neutral-300 group-hover:text-white">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
