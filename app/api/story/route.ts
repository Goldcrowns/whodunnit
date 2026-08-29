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
    Sen interaktif bir dedektiflik oyununun motorusun.
    
    GEÇMİŞ HİKAYE:
    ${history.join("\n")}
    
    SON SEÇİM:
    ${chosenOption || "Oyun yeni başladı."}

    ÇOK ÖNEMLİ KURALLAR:
    1. "storyText" KISMI EN AZ 5, EN FAZLA 10 CÜMLE OLMALI. Uzanıp giden hikaye/roman gibi yazma! Doğrudan aksiyonun sonucunu ve dedektifin önündeki durumu söyle.
    2. Edebiyat yapma, lafı uzatma.
    3. Oyuncunun önündeki aksiyona göre tam 3 kısa ve net seçenek (A, B, C) üret.
    4. "searchKeyword" için 1-2 kelimelik İngilizce görsel arama terimi üret.

    ÇIKTI FORMATI (SADECE JSON):
    {
      "storyText": "Seçimi yaptın ve kapıyı açtın. Odada kanlı bir anahtar duruyor.",
      "searchKeyword": "dark-room-key",
      "options": [
        { "id": "A", "text": "Anahtarı cebine at ve masayı incele." },
        { "id": "B", "text": "Kan izlerini takip ederek pencereye git." },
        { "id": "C", "text": "Arkanı dönüp koridoru kontrol et." }
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
