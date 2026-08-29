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
    2. Mevcut sahne ortamını aramak için tam olarak 1 veya 2 kelimelik İngilizce Unsplash arama terimi ("searchKeyword") belirle (Örn: "dark-room", "rainy-street", "detective", "old-book", "blood-stain", "police-car").
    3. Oyuncuya 3 adet seçenek sun (A, B, C).

    ÇIKTI FORMATI (SADECE JSON):
    {
      "storyText": "Hikayenin mevcut durumu...",
      "searchKeyword": "dark-street",
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
