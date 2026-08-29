"use client";

import { useState, useEffect } from "react";
import { LoaderCircle, BookOpen, RefreshCw } from "lucide-react";

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

  const fetchStockImage = (keyword: string) => {
    // Keyword'den tutarlı bir seed üreterek Picsum üzerinden kaliteli stok resmi çeker
    const hash = (keyword || "detective").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    setImageUrl(`https://picsum.photos/seed/${hash}/800/450`);
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
      if (data.searchKeyword) fetchStockImage(data.searchKeyword);
    } catch (err) {
      console.error("Story start error:", err);
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
      if (data.searchKeyword) fetchStockImage(data.searchKeyword);
    } catch (err) {
      console.error("Story update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 text-red-500 font-bold tracking-wider">
            <Search className="w-5 h-5" />
            <span>WHODUNNİT</span>
          </div>
          <button
            onClick={startNewStory}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-neutral-300 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Yeniden Başlat
          </button>
        </header>

        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-neutral-400">
            <LoaderCircle className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-xs tracking-wide">Hikaye ve görseller yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* Sahne Görsel Alanı */}
            <div className="relative w-full aspect-[16/9] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Stock Scene"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Yükleme hatası olursa doğrudan Unsplash genel stok görseline düşürür
                    e.currentTarget.src = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80";
                  }}
                />
              ) : (
                <div className="text-neutral-600 text-xs">Görsel yükleniyor...</div>
              )}
            </div>

            {/* Hikaye Metni */}
            <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl text-neutral-200 text-sm md:text-base leading-relaxed">
              {currentStep?.storyText}
            </div>

            {/* Seçenekler (A, B, C) */}
            <div className="flex flex-col gap-3">
              {currentStep?.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left bg-neutral-950 hover:bg-red-950/20 border border-neutral-800 hover:border-red-600/50 p-4 rounded-xl text-xs md:text-sm transition flex items-start gap-3 group"
                >
                  <span className="bg-red-950 text-red-500 border border-red-800/60 font-mono font-bold w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition">
                    {option.id}
                  </span>
                  <span className="text-neutral-300 group-hover:text-white mt-0.5">
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
