'use client';

import { useState } from 'react';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSpeak = async () => {
    if (!text) return;
    setLoading(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Ses oluşturulamadı');

      // Dönen audio verisini Blob yapıp oynatıyoruz
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      audio.play();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 max-w-md">
      <textarea
        className="p-2 border rounded text-black"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="AI'ın seslendirmesini istediğin metni yaz..."
      />
      <button
        onClick={handleSpeak}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Ses Hazırlanıyor...' : 'Oku / Konuş'}
      </button>
    </div>
  );
}

