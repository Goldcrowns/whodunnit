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
    Sen metin tabanlı (Choice-based / Interactive Fiction) interaktif bir dedektiflik/gizem oyunu sunucususun.
    
    GEÇMİŞ HİKAYE AKIŞI:
    ${history.join("\n")}
    
    OYUNCUNUN SON SEÇİMİ:
    ${chosenOption || "Oyun henüz yeni başlıyor, ilk durumu kurgula."}

    GÖREV:
    - Oyuncunun son seçimine göre hikayeyi mantıklı, sürükleyici ve gizemli bir şekilde devam ettir (Yaklaşık 2-4 cümlelik betimleyici metin).
    - Hikayenin devamı için oyuncuya TAM OLARAK 4 adet seçenek sun (A, B, C ve BONUS).
    - Seçenekler dedektifin atabileceği farklı aksiyonları temsil etmeli.

    ÇIKTI FORMATI (SADECE JSON):
    {
      "storyText": "Hikayenin mevcut durumu ve olayın gelişimi...",
      "options": [
        { "id": "A", "text": "Birinci seçenek aksiyonu" },
        { "id": "B", "text": "İkinci seçenek aksiyonu" },
        { "id": "C", "text": "Üçüncü seçenek aksiyonu" }
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
