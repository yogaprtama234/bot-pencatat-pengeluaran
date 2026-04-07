const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIManager {
    constructor() {
        this.modelText = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        this.modelVision = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    }

    parseJSON(text) {
        try {
            const cleanText = text.replace(/```json|```/g, "").trim();
            // Find the first { and last } to extract JSON if there's surrounding text
            const start = cleanText.indexOf('{');
            const end = cleanText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(cleanText.substring(start, end + 1));
            }
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Gagal parse JSON dari AI:", text);
            return { items: [] };
        }
    }

    async extractExpenseFromText(text) {
        const prompt = `
        Anda adalah asisten pengelola pengeluaran. Ekstrak informasi pengeluaran secara DETAIL dari teks berikut: "${text}"

        RESPON HARUS DALAM FORMAT JSON MURNI TANPA CHAT TAMBAHAN:
        {
            "items": [
                { "category": "Kategori", "description": "Nama Item", "amount": 0 }
            ]
        }
        
        Aturan:
        1. SEBUTKAN SEMUA ITEM secara terpisah. Jangan digabung jadi satu total.
        2. Kategori harus umum (Makan, Transport, Belanja, Tagihan, Hiburan, dll).
        3. Amount adalah nominal angka saja untuk setiap item.
        4. Jika tidak ada informasi pengeluaran, kembalikan: { "items": [] }
        `;

        const result = await this.modelText.generateContent(prompt);
        const response = await result.response;
        return this.parseJSON(response.text());
    }

    async extractExpenseFromImage(base64Image, mimeType) {
        const prompt = `
        Anda adalah asisten pengelola pengeluaran. Analisis foto struk ini dan ekstrak SEMUA data pengeluaran secara DETAIL.

        RESPON HARUS DALAM FORMAT JSON MURNI TANPA CHAT TAMBAHAN:
        {
            "items": [
                { "category": "Kategori", "description": "Nama Barang", "amount": 0 }
            ]
        }
        
        Aturan:
        1. DAFTARKAN SETIAP ITEM yang ada di struk satu per satu. JANGAN menggabungkan item menjadi satu total "Struk Belanja".
        2. Jika ada 3 barang di struk, maka harus ada 3 objek di dalam array "items".
        3. Gunakan harga per item (setelah diskon jika ada) sebagai "amount".
        4. Jika gambar BUKAN struk belanja, kembalikan: { "items": [] }
        5. Berikan kategori yang sesuai untuk setiap item.
        `;

        const result = await this.modelVision.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType
                }
            }
        ]);
        const response = await result.response;
        return this.parseJSON(response.text());
    }
}

module.exports = new AIManager();
