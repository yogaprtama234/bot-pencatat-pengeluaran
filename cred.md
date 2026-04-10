# Cara Mendapatkan Kredensial .env

Ikuti langkah-langkah di bawah ini untuk mendapatkan semua kredensial yang dibutuhkan oleh bot ini.

---

## 1. Google Sheets API (Untuk Penyimpanan Data)

### A. Membuat Video Project di Google Cloud
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru (atau pilih yang sudah ada).
3. Cari **"Google Sheets API"** di kolom pencarian, lalu klik **Enable**.

### B. Membuat Service Account
1. Pergi ke menu **APIs & Services > Credentials**.
2. Klik **Create Credentials > Service Account**.
3. Isi nama service account (bebas), lalu klik **Create and Continue**.
4. Klik **Done** (tidak perlu mengisi role untuk saat ini).
5. Pada daftar service account yang muncul, klik email service account tersebut.
6. Pergi ke tab **Keys**, klik **Add Key > Create New Key**.
7. Pilih format **JSON**, lalu klik **Create**.
8. File JSON akan terdownload secara otomatis:
   - `client_email` adalah **GOOGLE_SERVICE_ACCOUNT_EMAIL**.
   - `private_key` adalah **GOOGLE_PRIVATE_KEY**.

### C. Menyiapkan Google Sheet
1. Buat Google Sheet baru di [sheets.new](https://sheets.new).
2. Lihat URL browser Anda. ID Spreadsheet berada di antara `/d/` dan `/edit`.
   - Contoh: `https://docs.google.com/spreadsheets/d/1abc12345XYZ/edit`
   - Maka **GOOGLE_SHEET_ID** adalah `1abc12345XYZ`.
3. **PENTING:** Klik tombol **Share** di Google Sheet tersebut, lalu masukkan email Service Account yang Anda dapatkan di langkah B (biasanya berakhiran `@project-id.iam.gserviceaccount.com`) sebagai **Editor**.

---

## 2. Gemini API Key (Untuk AI Chat)

1. Buka [Google AI Studio (MakerSuite)](https://aistudio.google.com/).
2. Login dengan akun Google Anda.
3. Klik tombol **Get API Key** di sidebar kiri.
4. Klik **Create API key in new project** (atau gunakan project yang sudah ada).
5. Salin API Key tersebut dan masukkan ke **GEMINI_API_KEY** di file `.env`.

---

## 3. Mengisi File .env

Buka file `.env` di project Anda dan isi nilainya:

```env
GOOGLE_SHEET_ID=isi_dengan_id_sheet
GOOGLE_SERVICE_ACCOUNT_EMAIL=isi_dengan_email_service_account
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nISI_DENGAN_PRIVATE_KEY_ANDA\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=isi_dengan_gemini_api_key
PORT=3000
```

> [!TIP]
> Pastikan `GOOGLE_PRIVATE_KEY` diapit tanda kutip ganda (`"`) dan semua karakter `\n` tetap ada agar terbaca dengan benar oleh sistem.
