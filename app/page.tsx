"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Send } from "lucide-react";

interface Suspect {
  id: string;
  name: string;
  role: string;
  alibiPrompt: string;
  dialogue: string;
  imageUrl: string | null;
  isGuilty: boolean;
}

interface CaseData {
  caseTitle: string;
  locationDescription: string;
  initialImageUrl: string | null;
  suspects: Suspect[];
}

export default function ProceduralCriminalCasePage() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [verdict, setVerdict] = useState<string | null>(null);

  useEffect(() => {
    generateNewCase();
  }, []);

  const generateNewCase = async () => {
    setLoading(true);
    setVerdict(null);
    setSelectedSuspect(null);

    const mockCaseData: CaseData = {
      caseTitle: "Gölge Konağı Cinayeti",
      locationDescription: "Eski, loş ışıklı bir kütüphane. Kırmızı kadife perdeler ve tozlu kitap rafları...",
      initialImageUrl: "/images/library_placeholder.jpg",
      suspects: [
        { id: "s1", name: "Kerem", role: "Uşak", alibiPrompt: "", dialogue: "O sırada gümüşleri parlatıyordum, efendim.", imageUrl: "/images/suspect_kerem.jpg", isGuilty: false },
        { id: "s2", name: "Aylin", role: "Mirasçı", alibiPrompt: "", dialogue: "Odama çekilmiştim, kimseyi görmedim.", imageUrl: "/images/suspect_aylin.jpg", isGuilty: true },
        { id: "s3", name: "Murat", role: "Bahçıvan", alibiPrompt: "", dialogue: "Seraları kontrol ediyordum, her zamanki işim.", imageUrl: "/images/suspect_murat.jpg", isGuilty: false },
      ],
    };

    setCaseData(mockCaseData);
    setLoading(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedSuspect) return;

    // Şüpheliye soru sorma mantığı (ileride AI API'sine bağlanacak yer)
    setSelectedSuspect({
      ...selectedSuspect,
      dialogue: `Dedektif, sorduğun "${inputMessage}" sorusuna cevabım şudur: Ben tamamen suçsuzum!`
    });

    setInputMessage("");
  };

  const handleAccuse = (suspect: Suspect) => {
    if (suspect.isGuilty) {
      setVerdict(`Tebrikler Dedektif! Katil ${suspect.name}'i yakaladın.`);
    } else {
      setVerdict(`${suspect.name} suçsuz! Gerçek katil kaçtı...`);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Yapay Zeka Hikaye ve Görselleri Üretiyor...</div>;
  if (!caseData) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Hata Oluştu!</div>;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-red-600 mb-2">WHODUNNIT</h1>
        <p className="text-neutral-400 text-sm">Yapay Zeka Tarafından Üretilen Prosedürel Suç Dosyası</p>
      </header>

      {/* Şüpheli Seçim Butonları / Seçim Alanı */}
      <div className="flex gap-3 mb-6 flex-wrap justify-center">
        {caseData.suspects.map((suspect) => (
          <button
            key={suspect.id}
            onClick={() => { setSelectedSuspect(suspect); setVerdict(null); }}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
              selectedSuspect?.id === suspect.id
                ? "border-red-600 bg-red-950/30 text-white"
                : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
            }`}
          >
            {suspect.name} ({suspect.role})
          </button>
        ))}
      </div>

      {/* Ana Oyun Alanı (Taslağa Göre Dizilim) */}
      <section className="w-full max-w-2xl border border-neutral-800 bg-neutral-900 rounded-2xl p-6 flex flex-col gap-6">
        
        {/* 1. RESİM ALANI */}
        <div className="relative w-full aspect-[16/9] bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
          {selectedSuspect?.imageUrl ? (
            <Image
              src={selectedSuspect.imageUrl}
              alt={selectedSuspect.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          ) : caseData.initialImageUrl ? (
            <Image
              src={caseData.initialImageUrl}
              alt="Crime Scene"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500">Görsel Yükleniyor</div>
          )}
        </div>

        {/* 2. AI MESAJI ALANI */}
        <div className="border border-neutral-800 bg-neutral-950/60 p-4 rounded-xl text-center min-h-[80px] flex items-center justify-center">
          {selectedSuspect ? (
            <p className="italic text-neutral-200">
              <span className="font-bold text-red-500 not-italic mb-1 block">{selectedSuspect.name}:</span>
              "{selectedSuspect.dialogue}"
            </p>
          ) : (
            <p className="text-neutral-400 text-sm italic">
              Sorgulamak istediğin şüpheliyi yukarıdan seç ve soru sor.
            </p>
          )}
        </div>

        {/* 3. PLACEHOLDER & İÇİNDE SAĞDA LUCIDE GÖNDER BUTONU */}
        <form onSubmit={handleSendMessage} className="relative w-full">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!selectedSuspect}
            placeholder={selectedSuspect ? `${selectedSuspect.name} isimli şüpheliye bir soru sor...` : "Önce bir şüpheli seçin..."}
            className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-red-600 text-sm transition placeholder:text-neutral-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!selectedSuspect || !inputMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-neutral-400 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Suçlama Butonu */}
        {selectedSuspect && (
          <button
            onClick={() => handleAccuse(selectedSuspect)}
            className="w-full bg-red-800 hover:bg-red-700 text-white py-3 rounded-xl font-semibold text-sm transition tracking-wide"
          >
            {selectedSuspect.name} ŞÜPHELİSİNİ KESİN OLARAK SUÇLA
          </button>
        )}
      </section>

      {/* Karar / Sonuç Paneli */}
      {verdict && (
        <div className="w-full max-w-2xl mt-6 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xl font-bold text-center text-red-500">
          {verdict}
        </div>
      )}
    </main>
  );
}

