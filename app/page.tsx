"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Yapay zekadan gelecek dinamik veri yapısı
interface CaseData {
  caseTitle: string;
  locationDescription: string;
  initialImageUrl: string | null; // Başlangıç mekanı resmi
  suspects: Suspect[];
}

interface Suspect {
  id: string;
  name: string;
  role: string;
  alibiPrompt: string; // LLM'den gelecek gizli prompt
  dialogue: string;
  imageUrl: string | null; // AI tarafından üretilecek şüpheli resmi
  isGuilty: boolean;
}

export default function ProceduralCriminalCasePage() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);

  // Sayfa yüklendiğinde yeni bir vaka oluştur (API call simülasyonu)
  useEffect(() => {
    generateNewCase();
  }, []);

  const generateNewCase = async () => {
    setLoading(true);
    setVerdict(null);
    setSelectedSuspect(null);

    // Burası gerçek API çağrısını yapacağın yer (Groq/Gemini + Stable Diffusion/DALL-E)
    // Şu an için simüle edilmiş veri kullanıyoruz:
    const mockCaseData: CaseData = {
      caseTitle: "Gölge Konağı Cinayeti",
      locationDescription: "Eski, loş ışıklı bir kütüphane. Kırmızı kadife perdeler ve tozlu kitap rafları...",
      initialImageUrl: "/images/library_placeholder.jpg", // Örnek resim yolu
      suspects: [
        { id: "s1", name: "Kerem", role: "Uşak", alibiPrompt: "AI, Kerem'in ifadesini korkmuş ve şüpheli bir dille yaz.", dialogue: "O sırada gümüşleri parlatıyordum, efendim.", imageUrl: "/images/suspect_kerem.jpg", isGuilty: false },
        { id: "s2", name: "Aylin", role: "Mirasçı", alibiPrompt: "AI, Aylin'in ifadesini soğukkanlı ve kibirli bir dille yaz.", dialogue: "Odama çekilmiştim, kimseyi görmedim.", imageUrl: "/images/suspect_aylin.jpg", isGuilty: true },
        { id: "s3", name: "Murat", role: "Bahçıvan", alibiPrompt: "AI, Murat'ın ifadesini yorgun ve dürüst bir dille yaz.", dialogue: "Seraları kontrol ediyordum, her zamanki işim.", imageUrl: "/images/suspect_murat.jpg", isGuilty: false },
      ],
    };

    // Gerçek API'de LLM metni üretecek, resim API'si de alibiPrompt'u resme dönüştürecek.
    setCaseData(mockCaseData);
    setLoading(false);
  };

  const handleAccuse = (suspect: Suspect) => {
    if (suspect.isGuilty) {
      setVerdict(`Tebrikler Dedektif! Katil ${suspect.name}'i yakaladın.`);
    } else {
      setVerdict(`${suspect.name} suçsuz! Gerçek katil kaçtı...`);
    }
  };

  if (loading) return <div className="text-white">Yapay Zeka Hikaye ve Görselleri Üretiyor...</div>;
  if (!caseData) return <div className="text-white">Hata Oluştu!</div>;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tighter text-red-600 mb-2">WHODUNNIT</h1>
        <p className="text-neutral-400">Yapay Zeka Tarafından Üretilen Prosedürel Suç Dosyası</p>
      </header>

      {/* Vaka Özeti ve Mekan Resmi */}
      <section className="w-full max-w-6xl border border-neutral-800 bg-neutral-900 rounded-2xl p-8 mb-8 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">{caseData.caseTitle}</h2>
          <p className="text-neutral-300 italic mb-6">"{caseData.locationDescription}"</p>
          <button 
            onClick={generateNewCase}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg text-sm transition"
          >
            YENİ VAKA OLUŞTUR
          </button>
        </div>
        <div className="relative aspect-[16/10] bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
          {caseData.initialImageUrl && (
            <Image 
              src={caseData.initialImageUrl} 
              alt="Crime Scene" 
              fill 
              className="object-cover" 
              sizes="(max-w-6xl) 50vw, 33vw"
            />
          )}
        </div>
      </section>

      {/* Şüpheli Listesi */}
      <section className="w-full max-w-6xl mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-center text-red-500">Şüphelileri Sorgula</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caseData.suspects.map((suspect) => (
            <div
              key={suspect.id}
              onClick={() => { setSelectedSuspect(suspect); setVerdict(null); }}
              className={`p-6 border rounded-2xl cursor-pointer transition flex flex-col items-center ${selectedSuspect?.id === suspect.id ? "border-red-600 bg-neutral-900" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"}`}
            >
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-neutral-700">
                {suspect.imageUrl && (
                  <Image src={suspect.imageUrl} alt={suspect.name} fill className="object-cover" sizes="128px" />
                )}
              </div>
              <h4 className="text-xl font-semibold">{suspect.name}</h4>
              <p className="text-sm text-neutral-400">{suspect.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sorgu Paneli */}
      {selectedSuspect && (
        <section className="w-full max-w-3xl border border-neutral-800 bg-neutral-900 p-8 rounded-2xl text-center space-y-6">
          <h3 className="text-2xl font-bold text-red-500">{selectedSuspect.name} Sorgulanıyor</h3>
          <p className="italic text-lg text-neutral-300">"{selectedSuspect.dialogue}"</p>
          <div className="flex justify-center gap-4 pt-4 border-t border-neutral-800">
            <button
              onClick={() => handleAccuse(selectedSuspect)}
              className="bg-red-700 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              SUÇLA VE DOSYAYI KAPAT
            </button>
          </div>
        </div>
      )}

      {/* Karar / Sonuç Mesajı */}
      {verdict && (
        <div className="mt-8 p-6 rounded-2xl bg-neutral-800 border border-neutral-700 text-2xl font-bold text-center">
          {verdict}
        </div>
      )}
    </main>
  );
}
