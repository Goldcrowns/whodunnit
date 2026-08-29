'use client';

import { useState } from 'react';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSpeak = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      // Sunucudan dönen detaylı hatayı ekrana basmak için
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Sunucu hatası: ${res.status}`);
      }

      // Audio verisini al ve URL oluştur
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      // Tarayıcının autoplay (otomatik oynatma) engeline takılmamak için promise yakalama
      await audio.play();

      // Ses bittikten sonra belleği temizle (Memory leak önleme)
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

    } catch (err: any) {
      console.error('TTS Hatası:', err);
      setErrorMessage(err.message || 'Ses çalınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 max-w-md">
      <textarea
        className="p-2 border rounded text-black outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="AI'ın seslendirmesini istediğin metni yaz..."
      />

      <button
        onClick={handleSpeak}
        disabled={loading || !text.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-all disabled:opacity-50"
      >
        {loading ? 'Ses Hazırlanıyor...' : 'Oku / Konuş'}
      </button>

      {/* Ekrandan hatayı anında takip etmek için */}
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
