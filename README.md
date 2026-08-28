# 🕵️‍♂️ Whodunnit

**Whodunnit**, klasik cinayet gizemi atmosferini modern yapay zekâ teknolojileriyle birleştiren **metin tabanlı ve dinamik görselli** bir interaktif hikaye (Visual Novel) oyunudur.

Geleneksel dallanan hikaye ağaçlarının aksine, bu projede her seçim **Google Gemini API** tarafından anlık olarak işlenir; sahne atmosferi ise **Hugging Face Inference API** üzerinden tamamen ücretsiz ve dinamik görsellerle ekrana yansıtılır.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

* **Framework:** Next.js (App Router) & TypeScript
* **Styling:** Tailwind CSS & Lucide React
* **Game Master (AI):** Google Gemini API (`gemini-1.5-flash`)
* **Görsel Motoru:** Hugging Face Inference API (`FLUX.1-dev` / `SDXL`)
* **Deployment:** Vercel

---

## ⚡ Temel Özellikler

* 🚂 **Dinamik Raylı Hikaye:** Sabit senaryo tabloları yoktur. Oyuncunun her seçimine göre Gemini API yeni durumlar, şüpheler ve diyaloglar üretir.
* 🎨 **Dinamik Visual Novel Görselleri:** Gemini API'nin ürettiği sahne prompt'ları, Hugging Face üzerindeki açık kaynaklı görsel modelleriyle anında oluşturulur ve arka plana basılır.
* 🕵️ **Whodunnit Kurgusu:** Sabit bir şüpheli kadrosu üzerinden ilerleyen, oyuncunun seçimleriyle engelleri aştığı ve nihai finale doğru aktığı cinayet gizemi.
* 💻 **Minimalist UI:** Ekran kalabalığından arındırılmış, Max Payne / Film Noir tarzında diyalog kutusu ve seçenek paneli.

---

## 🚀 Kurulum ve Yerel Çalıştırma

### 1. Repoyu Klonlayın
```bash
git clone [https://github.com/kullanici-adiniz/whodunnit.git](https://github.com/kullanici-adiniz/whodunnit.git)
cd whodunnit
