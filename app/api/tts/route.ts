import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Metin girmediniz.' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    // API Key kontrolü
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY bulunamadı!');
      return NextResponse.json({ error: 'Vercel tarafında API anahtarı tanımlı değil.' }, { status: 500 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs Yanıt Hatası:', response.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs Hatası (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Sunucu Hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
