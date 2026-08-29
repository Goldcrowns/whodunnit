import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Sen sürükleyici dedektiflik oyunları tasarlayan bir yapay zekasın. 
    Bana benzersiz, orijinal ve rastgele kurgulanmış bir cinayet/suç vakası oluştur.
    
    KURALLAR:
    1. Mekan, kurban ve hikaye tamamen rastgele olsun.
    2. Tam olarak 3 adet şüpheli oluştur.
    3. ŞÜPHELİLERDEN SADECE VE SADECE BİR TANESİNİN "isGuilty" DEĞERİ true OLSUN, DİĞER İKİSİ false OLSUN.
    4. Yanıtı SADECE geçerli bir JSON nesnesi olarak ver. Ekstra açıklama veya markdown ekleme.

    İSTENEN JSON FORMATI:
    {
      "caseTitle": "Olay/Vaka Başlığı",
      "locationDescription": "Olay yerinin ve havanın detaylı, gizemli betimlemesi",
      "initialImageUrl": null,
      "suspects": [
        {
          "id": "s1",
          "name": "Rastgele İsim",
          "role": "Mesleği / Rolü",
          "alibiPrompt": "Olay anındaki mazereti ve arka plan bilgisi",
          "dialogue": "İlk sorgudaki tedirgin veya kendinden emin açılış cümlesi",
          "imageUrl": null,
          "isGuilty": false
        },
        {
          "id": "s2",
          "name": "Rastgele İsim",
          "role": "Mesleği / Rolü",
          "alibiPrompt": "Olay anındaki mazereti ve arka plan bilgisi",
          "dialogue": "İlk sorgudaki açılış cümlesi",
          "imageUrl": null,
          "isGuilty": true
        },
        {
          "id": "s3",
          "name": "Rastgele İsim",
          "role": "Mesleği / Rolü",
          "alibiPrompt": "Olay anındaki mazereti ve arka plan bilgisi",
          "dialogue": "İlk sorgudaki açılış cümlesi",
          "imageUrl": null,
          "isGuilty": false
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const caseData = JSON.parse(responseText);

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Vaka üretme hatası:", error);
    return NextResponse.json(
      { error: "Yapay zeka vaka oluştururken bir hata oluştu." },
      { status: 500 }
    );
  }
}
