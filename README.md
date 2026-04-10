# Bot WhatsApp Pencatat Pengeluaran Otomatis (Google Sheets & Gemini AI)

Proyek ini adalah bot WhatsApp yang berfungsi sebagai asisten pribadi untuk mencatat setiap pengeluaran keuangan secara otomatis ke dalam Google Sheets. Bot ini menggunakan kecerdasan buatan (Gemini AI) untuk memahami pesan teks maupun foto struk belanja, sehingga pengguna tidak perlu memasukkan data secara manual ke dalam tabel.

## Fitur Utama

1.  Pencatatan Berbasis Teks: Bot dapat memproses kalimat seperti "makan siang 25 ribu" atau "beli bensin 50000" dan mengekstrak nominal serta kategorinya secara otomatis.
2.  Pemindaian Struk Belanja: Pengguna cukup mengirimkan foto struk atau kuitansi, dan bot akan menganalisis konten gambar tersebut menggunakan AI untuk mencatat rincian barang dan harganya.
3.  Integrasi Google Sheets: Semua data yang berhasil diproses akan langsung disimpan ke dalam Google Spreadsheet yang telah ditentukan.
4.  Manajemen Multi-User: Bot secara otomatis membuatkan tab (sheet) terpisah untuk setiap nomor WhatsApp yang menghubunginya, sehingga data antar pengguna tidak akan bercampur.
5.  Rekap Data: Tersedia perintah untuk melihat ringkasan pengeluaran harian maupun total pengeluaran yang sudah tercatat.
6.  Hapus Data: Fitur untuk membersihkan riwayat pencatatan jika pengguna ingin memulai dari awal.

## Persyaratan Sistem

Sebelum menjalankan bot ini, pastikan Anda telah menyiapkan hal-hal berikut:

1.  Node.js (Versi 16 ke atas) dan NPM.
2.  Akun Google Cloud Platform untuk mengakses Google Sheets API.
3.  API Key dari Google AI Studio (untuk akses model Gemini).
4.  Akun WhatsApp yang akan digunakan sebagai server bot (disarankan menggunakan nomor cadangan).

## Persiapan Lingkungan (Setup)

> [!NOTE]
> Panduan lengkap dan detail langkah-demi-langkah untuk mendapatkan API Key dan Kredensial Google Sheets dapat dilihat di: **[cred.md](file:///Users/yogaaaaprtm23/bot-wa/cred.md)**

### 1. Konfigurasi Google Sheets

1.  Buat Spreadsheet baru di Google Sheets.
2.  Salin ID Spreadsheet dari URL (ID adalah rangkaian karakter panjang setelah /d/ dan sebelum /edit).
3.  Buka Google Cloud Console, buat proyek baru, dan aktifkan Google Sheets API.
4.  Buat Service Account, unduh file kunci JSON, dan simpan informasi Email Service Account serta Private Key.
5.  Bagikan (Share) Spreadsheet Anda ke email Service Account tersebut dengan akses Editor.

### 2. Konfigurasi Gemini AI

1.  Kunjungi Google AI Studio.
2.  Dapatkan API Key untuk model Gemini 1.5 (Pro atau Flash).

### 3. Pengaturan File Environment

Buat file bernama .env di direktori utama proyek, lalu isi dengan format sebagai berikut:

GOOGLE_SHEET_ID=isi_dengan_id_spreadsheet_anda
GOOGLE_SERVICE_ACCOUNT_EMAIL=email_service_account_anda
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nisi_private_key_anda\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=isi_dengan_api_key_gemini_anda
PORT=3000

## Instalasi

1.  Buka terminal atau command prompt di direktori proyek.
2.  Jalankan perintah berikut untuk menginstal semua dependensi:
    npm install
3.  Jalankan bot dengan perintah:
    node index.js
4.  Sebuah kode QR akan muncul di terminal. Buka WhatsApp di ponsel Anda, masuk ke menu Perangkat Tertaut, lalu pindai kode QR tersebut.

## Panduan Penggunaan

Setelah bot aktif, Anda bisa berinteraksi dengannya melalui pesan WhatsApp:

1.  Mencatat Teks: Kirim pesan langsung seperti "Beli kopi 15000" atau "Bayar listrik 200rb".
2.  Mencatat Gambar: Kirim foto struk belanja yang jelas. Bot akan merespons jika data sudah berhasil disimpan.
3.  Daftar Perintah (Command):
    *   /menu - Menampilkan bantuan penggunaan.
    *   /rekap - Melihat daftar pengeluaran hanya untuk hari ini.
    *   /cektotal - Melihat semua transaksi serta total saldo yang sudah dikeluarkan.
    *   /clear - Menghapus seluruh baris data pada tab pribadi Anda di Google Sheets.

## Struktur Folder

1.  index.js: File utama untuk inisialisasi koneksi WhatsApp (Baileys).
2.  src/handler.js: Logika utama untuk menangani pesan masuk dan perintah pengguna.
3.  src/ai.js: Integrasi dengan Google Generative AI untuk pemrosesan teks dan gambar.
4.  src/sheets.js: Logika interaksi dengan Google Sheets API (tambah data, rekap, hapus).
5.  sessions/: Folder otomatis untuk menyimpan data sesi login WhatsApp (jangan dihapus agar tidak perlu scan ulang).

## Catatan Penting

Data Anda disimpan secara lokal pada sesi WhatsApp di server tempat bot dijalankan, dan data keuangan Anda tersimpan di Google Sheets pribadi Anda. Pastikan untuk menjaga keamanan API Key dan Private Key Anda untuk menghindari penyalahgunaan oleh pihak lain.
