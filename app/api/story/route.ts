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
    Sen hızlı tempolu bir dedektiflik oyunusun.

    GEÇMİŞ HİKAYE:
    ${history.join("\n")}

    SON SEÇİM:
    ${chosenOption || "Oyun yeni başladı."}

    GÖREVLER:
    1. "storyText": Sadece yapılan aksiyonun doğrudan sonucunu yaz (Maksimum 10 kısa cümle). Anlatıyı uzatma.
    2. "imagePrompt": Sahneye özel 2-3 kelimelik İngilizce detay yaz (Örn: "bloody knife on floor", "dark alley rainy night", "police car lights").
    3. "options": Tam 4 tane net aksiyon seçeneği sun (A, B, C ve Bonus).

    ÇIKTI FORMATI (SADECE JSON):
    {
      "storyText": "Metin...",
      "imagePrompt": "İngilizce kelimeler...",
      "options": [
        { "id": "A", "text": "Seçenek 1" },
        { "id": "B", "text": "Seçenek 2" },
        { "id": "C", "text": "Seçenek 3" }
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
