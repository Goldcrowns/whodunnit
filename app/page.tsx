"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Send, RefreshCw, LoaderCircle } from "lucide-react";

// 1. VERİ YAPILARI (Hâlâ Tip Güvenliği İçin Gerekli)

// Şüpheli tipi - kodda hazır isim/rol tutmaz.
interface Suspect {
  id: string;
  name: string;      // AI tarafından rastgele üretilecek (Örn: "Ahmet", "John")
  role: string;      // AI tarafından rastgele üretilecek (Örn: "Doktor", "Bahçıvan")
  alibiPrompt: string;
  dialogue: string;  // AI'ın karakter olarak vereceği ilk yanıt
  imageUrl: string | null;
  isGuilty: boolean; // AI'ın rastgele atayacağı suçluluk durumu
}

// Suç Dosyası tipi - kodda hazır başlık/mekan tutmaz.
interface CaseData {
  caseTitle: string;        // AI tarafından rastgele üretilecek (Örn: "X Villası Cinayeti")
  locationDescription: string; // AI tarafından rastgele üretilecek (Örn: "Loş bir kütüphane")
  initialImageUrl: string | null;
  suspects: Suspect[];      // AI tarafından rastgele üretilen şüpheli listesi
}

export default function ProceduralCriminalCasePage() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [verdict, setVerdict] = useState<string | null>(null);

  useEffect(() => {
    generateNewCase();
  }, []);

  // 1. YAPAY ZEKAYA TAMAMEN YENİ VE RASTGELE BİR VAKA ÜRETTİRME
  const generateNewCase = async () => {
    setLoading(true);
    setVerdict(null);
    setSelectedSuspect(null);

    try {
      // Kod içinde Aylin, Kerem vb. hazır mock verisi yok.
      // API Route (Gemini/Groq API) çağrılır ve o bize her şeyi rastgele döner.
      const res = await fetch("/api/generate-case");
      
      if (!res.ok) {
        throw new Error("Vaka üretme API hatası.");
      }
      
      const data: CaseData = await res.json();
      setCaseData(data);
    } catch (err) {
      console.error("Vaka üretilirken hata oluştu:", err);
      // Hata durumunda kullanıcıya bilgi ver
      setVerdict("Yapay zeka hikaye üretemedi, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SEÇİLİ ŞÜPHELİYE SORU SORMA (AI KARAKTER CEVABI)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedSuspect || chatLoading) return;

    const userQuery = inputMessage;
    setInputMessage("");
    setChatLoading(true);

    try {
      // API'ye seçili şüphelinin verisini, vakanın bağlamını ve oyuncunun sorusunu gönder
      const res = await fetch("/api/chat-suspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspect: selectedSuspect, // Şüphelinin AI tarafından üretilen ismi/rolü buradadır
          caseContext: caseData?.locationDescription,
          userQuery: userQuery,
        }),
      });

      const data = await res.json();

      // UI üzerindeki aktif şüphelinin diyaloğunu AI cevabı ile güncelle
      const updatedDialogue = data.reply;
      setSelectedSuspect({
        ...selectedSuspect,
        dialogue: updatedDialogue,
      });

      // Ana caseData state'ini de güncelle (diyaloğu kalıcı kılmak için)
      if (caseData) {
        setCaseData({
          ...caseData,
          suspects: caseData.suspects.map((s) =>
            s.id === selectedSuspect.id ? { ...s, dialogue: updatedDialogue } : s
          ),
        });
      }
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAccuse = (suspect: Suspect) => {
    // isGuilty bilgisi de tamamen AI tarafından rastgele atanmıştır.
    if (suspect.isGuilty) {
      setVerdict(`Tebrikler Dedektif! Katil olan ${suspect.name} (${suspect.role}) yakalandı!`);
    } else {
      setVerdict(`${suspect.name} suçsuz çıktı! Gerçek katil aramızda dolaşmaya devam ediyor...`);
    }
  };

  // Yükleme Ekranı
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-6">
        <LoaderCircle className="w-12 h-12 animate-spin text-red-600" />
        <div className="text-center">
          <p className="text-xl font-semibold text-neutral-200">Kurgu Başlıyor...</p>
          <p className="text-sm tracking-wide text-neutral-500 max-w-xs mt-1">Yapay Zeka benzersiz bir suç hikayesi, olay yeri ve şüphelileri tasarlıyor...</p>
        </div>
      </div>
    );
  }

  // Hata Ekranı
  if (!caseData && !loading) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Vaka Oluşturulamadı! Lütfen Sayfayı Yenileyin.</div>;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center">
      <header className="mb-6 text-center relative w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-red-600 mb-1">WHODUNNIT</h1>
        {/* Vaka başlığı AI tarafından rastgele üretilmiştir */}
        <p className="text-neutral-400 text-xs md:text-sm">{caseData?.caseTitle}</p>
        
        {/* Yeni Vaka Üretme Butonu */}
        <button
          onClick={generateNewCase}
          className="mt-4 inline-flex items-center gap-2 text-xs bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-2 rounded-lg text-neutral-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Başka Bir Vaka Başlat
        </button>
      </header>

      {/* Şüpheli Seçim Butonları - AI tarafından rastgele üretilen şüpheliler */}
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {caseData?.suspects.map((suspect) => (
          <button
            key={suspect.id}
            onClick={() => { setSelectedSuspect(suspect); setVerdict(null); }}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition flex items-center gap-1.5 ${
              selectedSuspect?.id === suspect.id
                ? "border-red-600 bg-red-950/30 text-white"
                : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
            }`}
          >
            {suspect.name} <span className="text-xs opacity-60">({suspect.role})</span>
          </button>
        ))}
      </div>

      {/* Ana Oyun Alanı */}
      <section className="w-full max-w-2xl border border-neutral-800 bg-neutral-900 rounded-2xl p-6 flex flex-col gap-6">
        
        {/* Visual / Image Area (AI tarafından üretilecek) */}
        <div className="relative w-full aspect-[16/9] bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 flex items-center justify-center">
          {selectedSuspect?.imageUrl ? (
            <Image
              src={selectedSuspect.imageUrl}
              alt={selectedSuspect.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          ) : caseData?.initialImageUrl ? (
            <Image
              src={caseData.initialImageUrl}
              alt="Crime Scene"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          ) : (
            <div className="w-full h-full p-4 flex items-center justify-center text-neutral-500 text-center text-xs md:text-sm italic">
              {caseData?.locationDescription}
            </div>
          )}
        </div>

        {/* AI Dialogue Area */}
        <div className="border border-neutral-800 bg-neutral-950/60 p-4 rounded-xl text-center min-h-[100px] flex items-center justify-center">
          {chatLoading ? (
            <span className="text-neutral-500 text-sm animate-pulse">Şüpheli cevap veriyor...</span>
          ) : selectedSuspect ? (
            <p className="italic text-neutral-200 text-sm md:text-base">
              <span className="font-bold text-red-500 not-italic mb-1 block">{selectedSuspect.name} ({selectedSuspect.role}):</span>
              "{selectedSuspect.dialogue}"
            </p>
          ) : (
            <p className="text-neutral-400 text-sm italic">
              Yukarıdan sorgulamak istediğin şüpheliyi seç ve soru sor.
            </p>
          )}
        </div>

        {/* Input Box */}
        <form onSubmit={handleSendMessage} className="relative w-full">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!selectedSuspect || chatLoading}
            placeholder={selectedSuspect ? `${selectedSuspect.name} isimli şüpheliye soru sor...` : "Önce bir şüpheli seçin..."}
            className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-red-600 text-sm transition placeholder:text-neutral-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!selectedSuspect || !inputMessage.trim() || chatLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-neutral-400 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Accuse Button */}
        {selectedSuspect && (
          <button
            onClick={() => handleAccuse(selectedSuspect)}
            className="w-full bg-red-900/80 hover:bg-red-800 text-white py-3.5 rounded-xl font-semibold text-sm transition tracking-wide border border-red-700/50"
          >
            {selectedSuspect.name} ŞÜPHELİSİNİ SUÇLA
          </button>
        )}
      </section>

      {/* Verdict Output */}
      {verdict && (
        <div className="w-full max-w-2xl mt-6 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-lg font-bold text-center text-red-500 animate-pulse">
          {verdict}
        </div>
      )}
    </main>
  );
}
