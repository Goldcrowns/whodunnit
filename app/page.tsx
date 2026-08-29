"use client";

import { useState, useEffect } from "react";
import { LoaderCircle, BookOpen, RefreshCw, Search } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface StoryStep {
  storyText: string;
  searchKeyword: string;
  options: Option[];
}

export default function InteractiveStoryPage() {
  const [currentStep, setCurrentStep] = useState<StoryStep | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    startNewStory();
  }, []);

  // Metni kod tarafında kesen fonksiyon (Varsayılan: İlk 2 Cümle)
  const truncateStory = (text: string, sentenceCount: number = 2) => {
    if (!text) return "";
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, sentenceCount).join(" ");
  };

  const updateImage = (keyword: string) => {
    const cleanKeyword = keyword ? encodeURIComponent(keyword.trim().toLowerCase()) : "detective";
    const sig = Math.floor(Math.random() * 9999);
    // Unsplash temalı görsel çekimi
    setImageUrl(`https://source.unsplash.com/800x450/?dark,detective,${cleanKeyword}&sig=${sig}`);
  };

  const startNewStory = async () => {
    setLoading(true);
    setHistory([]);
    setImageUrl(null);
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [], chosenOption: null }),
      });
      const data: StoryStep = await res.json();
      setCurrentStep(data);
      setHistory([data.storyText]);
      if (data.searchKeyword) updateImage(data.searchKeyword);
    } catch (err) {
      console.error("Story error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (option: Option) => {
    if (loading || !currentStep) return;

    setLoading(true);
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
      if (data.searchKeyword) updateImage(data.searchKeyword);
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
          <button
            onClick={startNewStory}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-neutral-300 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Yeniden Başlat
          </button>
        </header>

        {loading ? (
          <div className="min-h-[260px] flex flex-col items-center justify-center gap-2 text-neutral-400">
            <LoaderCircle className="w-7 h-7 animate-spin text-red-600" />
            <p className="text-xs">Yeni durum yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* Görsel Alanı (Garantili Fallback Dahil) */}
            <div className="relative w-full aspect-[16/9] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Scene"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Servis patlarsa doğrudan bu güvenli static stok görsele düşer
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              ) : (
                <div className="text-neutral-600 text-xs">Görsel Yükleniyor...</div>
              )}
            </div>

            {/* Kod Tarafında 2 Cümleye Kesilmiş Metin */}
            <div className="bg-neutral-950 border border-neutral-800/80 p-4 rounded-xl text-neutral-200 text-sm leading-snug font-medium">
              {currentStep?.storyText ? truncateStory(currentStep.storyText, 2) : ""}
            </div>

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
