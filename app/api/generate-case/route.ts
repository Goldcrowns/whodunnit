import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY ortam değişkeni tanımlı değil." },
        { status: 500 }
      );
    }

    // Model tanımı (gemini-flash-lite-latest veya gemini-2.5-flash)
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Sen bir dedektiflik oyunu yapay zekasısın.
    Bana Türkçe olarak 3 şüpheli içeren rastgele bir suç vakası kurgula.
    Şüphelilerden SADECE BİRİNİN "isGuilty" değeri true olsun, diğer ikisi false olsun.

    Yanıtı SADECE aşağıdaki JSON formatında ver:
    {
      "caseTitle": "Vaka Başlığı",
      "locationDescription": "Olay yeri açıklaması",
      "initialImageUrl": null,
      "suspects": [
        { "id": "s1", "name": "İsim 1", "role": "Rol 1", "alibiPrompt": "", "dialogue": "Açılış cümlesi 1", "imageUrl": null, "isGuilty": false },
        { "id": "s2", "name": "İsim 2", "role": "Rol 2", "alibiPrompt": "", "dialogue": "Açılış cümlesi 2", "imageUrl": null, "isGuilty": true },
        { "id": "s3", "name": "İsim 3", "role": "Rol 3", "alibiPrompt": "", "dialogue": "Açılış cümlesi 3", "imageUrl": null, "isGuilty": false }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const caseData = JSON.parse(responseText);

    return NextResponse.json(caseData);
  } catch (error: any) {
    console.error("Vaka üretme hatası:", error);
    return NextResponse.json(
      { error: error?.message || "Vaka oluşturulurken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
