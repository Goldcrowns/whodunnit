import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { history, chosenOption } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Sen metin tabanlı (Choice-based) bir dedektiflik/gizem oyunu sunucususun.
    
    GEÇMİŞ HİKAYE AKIŞI:
    ${history.join("\n")}
    
    OYUNCUNUN SON SEÇİMİ:
    ${chosenOption || "Oyun henüz yeni başlıyor, ilk durumu kurgula."}

    GÖREVLERİN:
    1. Hikayeyi sürükleyici bir şekilde devam ettir (Türkçe).
    2. Mevcut sahne ortamı için 1-2 kelimelik İngilizce görsel anahtar kelimesi ("searchKeyword") belirle (Örn: "rainy-street", "detective-office", "old-letter", "crime-scene", "shadowy-figure").
    3. Oyuncuya 3 adet seçenek sun (A, B, C ve BONUS).

    ÇIKTI FORMATI (SADECE JSON):
    {
      "storyText": "Hikayenin mevcut durumu...",
      "searchKeyword": "detective-office",
      "options": [
        { "id": "A", "text": "Birinci seçenek" },
        { "id": "B", "text": "İkinci seçenek" },
        { "id": "C", "text": "Üçüncü seçenek" }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const storyStep = JSON.parse(responseText);

    return NextResponse.json(storyStep);
  } catch (error: any) {
    console.error("Story API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Hikaye üretilemedi." },
      { status: 500 }
    );
  }
}
