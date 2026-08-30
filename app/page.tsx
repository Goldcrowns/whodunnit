"use client";

import { useState, useEffect, useRef } from "react";
import { LoaderCircle, RefreshCw, Search, Volume2, VolumeX, ShieldAlert, CheckCircle2, XCircle, FileText, UserCheck } from "lucide-react";

interface Suspect {
  id: string;
  name: string;
  role: string;
  alibi: string;
}

interface CaseData {
  title: string;
  crimeScene: string;
  victim: string;
  suspects: Suspect[];
  secretKillerId: string;
  clues: string[];
  solutionRationale: string;
}

interface VerificationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  solutionRationale: string;
}

export default function WhodunnitGamePage() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Oyun Durumu
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [userReasoning, setUserReasoning] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Ses Durumu Yönetimi
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startNewCase();
  }, []);

  const updateImage = (prompt: string) => {
    const cleanPrompt = encodeURIComponent(`dark noir detective mystery crime scene, ${prompt || "crime scene"}`);
    const seed = Math.floor(Math.random() * 9999);
    setImageUrl(`https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=450&nologo=true&seed=${seed}`);
  };

  const startNewCase = async () => {
    setLoading(true);
    setCaseData(null);
    setSelectedSuspectId(null);
    setUserReasoning("");
    setVerificationResult(null);
    setImageUrl(null);
    setAudioError(null);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch("/api/whodunnit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_CASE" }),
      });
      
      const data = await res.json();
      if (data.success && data.caseData) {
        setCaseData(data.caseData);
        updateImage(`${data.caseData.title} ${data.caseData.victim}`);
      }
    } catch (err) {
      console.error("Vaka yüklenirken hata oluştu:", err);
    } font-medium {
      setLoading(false);
    }
  };

  const handleVerifyAccusation = async () => {
    if (!selectedSuspectId || !caseData || verifying) return;

    setVerifying(true);
    setAudioError(null);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch("/api/whodunnit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_ACCUSATION",
          payload: {
            selectedSuspectId,
            userReasoning,
            secretKillerId: caseData.secretKillerId,
            solutionRationale: caseData.solutionRationale,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVerificationResult({
          isCorrect: data.isCorrect,
          score: data.score,
          feedback: data.feedback,
          solutionRationale: data.solutionRationale,
        });
      }
    } catch (err) {
      console.error("Doğrulama hatası:", err);
    } finally {
      setVerifying(false);
    }
  };

  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak) return;

    if (isSpeaking && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsSpeaking(false);
      return;
    }

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

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col gap-5">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-red-500 font-bold tracking-wider text-base">
            <Search className="w-5 h-5" />
            <span>WHODUNNİT: DEDEKTİF DOSYASI</span>
          </div>

          <div className="flex items-center gap-2">
            {caseData?.crimeScene && (
              <button
                onClick={() => speakText(`${caseData.title}. Kurban: ${caseData.victim}. Olay yeri: ${caseData.crimeScene}`)}
                disabled={loading}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                  isSpeaking
                    ? "bg-red-950/50 border-red-800 text-red-400 animate-pulse"
                    : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300"
                }`}
                title={isSpeaking ? "Sesi Durdur" : "Raporu Seslendir"}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Durdur" : "Oku"}</span>
              </button>
            )}

            <button
              onClick={startNewCase}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-neutral-300 transition flex items-center gap-1.5 border border-neutral-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Yeni Vaka
            </button>
          </div>
        </header>

        {loading ? (
          <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 text-neutral-400">
            <LoaderCircle className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-sm font-medium">Gemini AI Yeni Cinayet Senaryosu Kurguluyor...</p>
          </div>
        ) : caseData ? (
          <>
            {/* Vaka Görseli */}
            {imageUrl && (
              <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <img src={imageUrl} alt="Olay Yeri" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-red-950/90 text-red-400 text-xs px-2.5 py-1 rounded border border-red-800 font-mono">
                  {caseData.title}
                </div>
              </div>
            )}

            {/* Olay Yeri ve Kurban Bilgisi */}
            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex flex-col gap-2">
              <div className="text-xs text-red-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Kurban & Olay Yeri İncelemesi
              </div>
              <p className="text-sm text-neutral-200"><strong className="text-neutral-100">Kurban:</strong> {caseData.victim}</p>
              <p className="text-xs text-neutral-400 leading-relaxed">{caseData.crimeScene}</p>
            </div>

            {/* Bulunan İpuçları */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Olay Yeri İpuçları</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {caseData.clues.map((clue, idx) => (
                  <div key={idx} className="bg-neutral-950/60 border border-neutral-800 p-2.5 rounded-lg text-xs text-amber-400/90 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{clue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Şüpheli Sorgulamaları */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Şüpheli Sorgu İfadeleri</span>
              {caseData.suspects.map((suspect) => {
                const isSelected = selectedSuspectId === suspect.id;
                return (
                  <button
                    key={suspect.id}
                    disabled={!!verificationResult}
                    onClick={() => setSelectedSuspectId(suspect.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 relative ${
                      isSelected
                        ? "bg-red-950/30 border-red-600"
                        : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center font-bold ${
                          isSelected ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-300"
                        }`}>
                          {suspect.id}
                        </span>
                        <span className="text-sm font-semibold text-neutral-100">{suspect.name}</span>
                        <span className="text-xs text-neutral-500">({suspect.role})</span>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-xs text-neutral-400 pl-8">
                      <strong className="text-neutral-300">İfade / Mazeret:</strong> "{suspect.alibi}"
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Suçlama Mantığı ve Karar Ver Butonu */}
            {!verificationResult && (
              <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800">
                <textarea
                  value={userReasoning}
                  onChange={(e) => setUserReasoning(e.target.value)}
                  placeholder="Katili nasıl tespit ettiğini ve ifadesindeki çelişkiyi açıkla (İsteğe bağlı)..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-red-600 min-h-[70px] resize-none"
                />
                
                <button
                  onClick={handleVerifyAccusation}
                  disabled={!selectedSuspectId || verifying}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
                >
                  {verifying ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      <span>Değerlendiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Suçlamada Bulun ve Vakayı Kapat</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Değerlendirme & Sonuç Ekranı */}
            {verificationResult && (
              <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
                verificationResult.isCorrect 
                  ? "bg-emerald-950/30 border-emerald-800 text-emerald-200" 
                  : "bg-red-950/30 border-red-800 text-red-200"
              }`}>
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verificationResult.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span>{verificationResult.isCorrect ? "VAKA ÇÖZÜLDÜ!" : "KATİL KAÇTI!"}</span>
                  </div>
                  <div className="text-xs font-mono font-bold px-2.5 py-1 bg-neutral-900 rounded border border-neutral-700">
                    Puan: {verificationResult.score} / 100
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <p><strong className="text-neutral-100">Baş Komiser Raporu:</strong> {verificationResult.feedback}</p>
                  <p className="text-neutral-400 border-t border-neutral-800/60 pt-2 mt-2">
                    <strong className="text-neutral-300">Gerçek Çözüm Gerekçesi:</strong> {verificationResult.solutionRationale}
                  </p>
                </div>
              </div>
            )}

            {/* Ses Hatası */}
            {audioError && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-2 rounded-lg">
                Ses Hatası: {audioError}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
              }
