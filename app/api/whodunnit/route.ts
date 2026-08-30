import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

// process.env.GEMINI_API_KEY çevresel değişkenini otomatik algılar
const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    // 1. DİNAMİK SENARYO VE İPUCU ÜRETİMİ (AI)
    if (action === 'GENERATE_CASE') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Sen Criminal Case oyunları için sürükleyici vaka senaryoları yazan bir dedektiflik yazarısın. 
          Oyuncunun mantık yürüterek çözebileceği özgün bir cinayet vaka senaryosu kurgula. 
          Şüphelilerden tam olarak 1 tanesi katil olmalı ve ipuçlarında bu katilin ifadesiyle çelişen gizli bir detay bulunmalıdır.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Vakanın başlığı' },
              crimeScene: { type: Type.STRING, description: 'Olay yeri detaylı inceleme açıklaması' },
              victim: { type: Type.STRING, description: 'Kurbanın adı, mesleği ve durumu' },
              suspects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: '1, 2 veya 3' },
                    name: { type: Type.STRING, description: 'Şüpheli adı' },
                    role: { type: Type.STRING, description: 'Kurbanla olan ilişkisi veya mesleği' },
                    alibi: { type: Type.STRING, description: 'Sorgulamadaki ifadesi / mazereti' },
                  },
                  required: ['id', 'name', 'role', 'alibi'],
                },
              },
              secretKillerId: { type: Type.STRING, description: 'Gerçek katilin şüpheli ID numarası ("1", "2" veya "3")' },
              clues: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Olay yerinde ve delil odasında bulunan kritik ipuçları',
              },
              solutionRationale: { type: Type.STRING, description: 'Katili yakalatan temel çelişki ve mantıksal gerekçe' },
            },
            required: ['title', 'crimeScene', 'victim', 'suspects', 'secretKillerId', 'clues', 'solutionRationale'],
          },
        },
      });

      const caseData = JSON.parse(response.text || '{}');

      return NextResponse.json({
        success: true,
        caseData,
      });
    }

    // 2. SINAV & DEDEKTİFLİK SUÇLAMASI DEĞERLENDİRMESİ (AI)
    if (action === 'VERIFY_ACCUSATION') {
      const { selectedSuspectId, userReasoning, secretKillerId, solutionRationale } = payload;
      const isCorrectKiller = selectedSuspectId === secretKillerId;

      const evalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
          Bir dedektiflik oyununda oyuncunun final sınavı değerlendirilecek.
          Gerçek Katil Çözüm Gerekçesi: ${solutionRationale}
          Oyuncunun Seçtiği Katil Doğru Mu?: ${isCorrectKiller ? 'Evet' : 'Hayır'}
          Oyuncunun Olayı Çözme Mantığı / Gerekçesi: "${userReasoning}"

          Oyuncunun mantık yürütmesini ve delil çıkarımını analiz et. 0 ile 100 arasında bir dedektiflik puanı ver ve baş komiser tarzında detaylı bir geri bildirim raporu yaz.
        `,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: '0-100 arası dedektiflik puanı' },
              feedback: { type: Type.STRING, description: 'Baş komiser geri bildirimi ve olay değerlendirmesi' },
            },
            required: ['score', 'feedback'],
          },
        },
      });

      const evaluation = JSON.parse(evalResponse.text || '{}');

      return NextResponse.json({
        success: true,
        isCorrect: isCorrectKiller,
        score: evaluation.score ?? (isCorrectKiller ? 85 : 20),
        feedback: evaluation.feedback,
        solutionRationale,
      });
    }

    return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
  } catch (error: any) {
    console.error('Whodunnit API Error:', error);
    return NextResponse.json(
      { error: 'Server Hatası', details: error?.message || 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
  
