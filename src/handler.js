const sheets = require('./sheets');
const ai = require('./ai');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

async function sendMenu(sock, remoteJid) {
    const menu = `*Halo! Saya adalah Bot Pencatat Pengeluaran.* 🏦

Saya bisa membantu mencatat pengeluaran Anda secara otomatis ke Google Sheet.

*Cara Penggunaan:*
1. *Ketik langsung*, misalnya : _"kopi 15000"_ atau _"makan siang 30rb"_
2. *Kirim foto struk* belanja Anda.

*Perintah yang tersedia:*
- */rekap* : Cek pengeluaran hari ini.
- */cektotal* : Cek daftar pengeluaran & total keseluruhan.
- */clear* : Hapus semua data pengeluaran Anda.
- */menu* : Tampilkan pesan bantuan ini.

_Semua data Anda tersimpan aman di tab khusus Anda sendiri._


Bot ini dibuat oleh @yogaaaaprtm_`;

    await sock.sendMessage(remoteJid, { text: menu });
}

async function handleMessage(sock, m) {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid;
    const sender = remoteJid.split('@')[0];
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const isImage = !!msg.message.imageMessage;

    console.log(`\n📩 Pesan Masuk dari ${sender}: ${text || '[Gambar]'}`);

    try {
        // Check if user is new to send greeting
        const { isNew } = await sheets.ensureUserSheet(remoteJid);
        if (isNew) {
            console.log(`👋 [${sender}] Mengirim pesan sambutan...`);
            await sendMenu(sock, remoteJid);
        }

        let result;

        if (isImage) {
            console.log(`🔍 [${sender}] Menganalisis gambar/struk...`);
            await sock.sendMessage(remoteJid, { text: "Sedang menganalisis struk... Tunggu sebentar ya 😇🙏" });
            const buffer = await downloadMediaMessage(msg, 'buffer');
            const base64 = buffer.toString('base64');
            result = await ai.extractExpenseFromImage(base64, "image/jpeg");
        } else if (text) {
            if (text.startsWith('/')) {
                console.log(`⚙️ [${sender}] Menjalankan perintah: ${text}`);
                await handleCommand(sock, remoteJid, text);
                return;
            } else {
                console.log(`🧠 [${sender}] Memproses teks via AI...`);
                result = await ai.extractExpenseFromText(text);
            }
        }

        if (result && result.items && result.items.length > 0) {
            await executeExpenseResult(sock, remoteJid, result);
        } else if (isImage || (text && !text.startsWith('/'))) {
            await sock.sendMessage(remoteJid, { text: "Maaf, saya tidak menemukan catatan pengeluaran dari pesan/foto tersebut. Pastikan foto struknya jelas ya!" });
        }

    } catch (err) {
        console.error("Error handling message:", err);
    }
}

async function handleCommand(sock, remoteJid, text) {
    const parts = text.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
        case '/rekap':
            const { data: todayExpenses } = await sheets.getExpenses(remoteJid);
            const today = new Date().toLocaleDateString('id-ID');
            const filtered = todayExpenses.filter(e => e.date && e.date.includes(today));
            const total = filtered.reduce((s, e) => s + e.amount, 0);

            let report = `📊 *Rekap Pengeluaran Hari Ini (${today})*\n\n`;
            if (filtered.length === 0) {
                report += "_Belum ada pengeluaran hari ini._";
            } else {
                filtered.forEach(e => {
                    report += `- ${e.description}: *Rp ${e.amount.toLocaleString('id-ID')}*\n`;
                });
                report += `\n*Total: Rp ${total.toLocaleString('id-ID')}*`;
            }

            await sock.sendMessage(remoteJid, { text: report });
            break;

        case '/cektotal':
            const { data: allExpenses } = await sheets.getExpenses(remoteJid);
            const totalAll = await sheets.getTotalExpense(remoteJid);

            let list = `🏦 *Daftar Pengeluaran Anda*\n\n`;
            if (allExpenses.length === 0) {
                list += "_Belum ada data pengeluaran._";
            } else {
                allExpenses.slice(-10).forEach(e => {
                    const datePart = e.date ? e.date.split(',')[0] : 'No Date';
                    list += `📅 ${datePart}\n🛒 ${e.description}\n💰 *Rp ${e.amount.toLocaleString('id-ID')}*\n\n`;
                });

                if (allExpenses.length > 10) list += `_...dan ${allExpenses.length - 10} data lainnya_\n`;
                list += `*TOTAL KESELURUHAN: Rp ${totalAll.toLocaleString('id-ID')}*`;
            }

            await sock.sendMessage(remoteJid, { text: list });
            break;

        case '/clear':
            await sheets.clearSheet(remoteJid);
            await sock.sendMessage(remoteJid, { text: "🚮 Semua catatan pengeluaran Anda telah dihapus." });
            break;

        case '/menu':
        case '/help':
        case '/start':
            await sendMenu(sock, remoteJid);
            break;

        default:
            await sock.sendMessage(remoteJid, { text: "Perintah tidak dikenal. Coba gunakan */menu* untuk melihat daftar perintah." });
    }
}

async function executeExpenseResult(sock, remoteJid, result) {
    let summary = `📝 *Catatan Pengeluaran:*\n`;
    let totalAdded = 0;

    for (const item of result.items) {
        try {
            const added = await sheets.addExpense(remoteJid, item.category, item.description, item.amount);
            console.log(`✅ [${remoteJid.split('@')[0]}] Tersimpan: ${item.description} (Rp ${item.amount})`);
            summary += `✅ ${added.description} (${added.category}): *Rp ${added.amount.toLocaleString('id-ID')}*\n`;
            totalAdded += added.amount;
        } catch (e) {
            summary += `❌ ${item.description}: ${e.message}\n`;
        }
    }

    if (result.items.length > 1) {
        summary += `\n*Subtotal: Rp ${totalAdded.toLocaleString('id-ID')}*`;
    }

    await sock.sendMessage(remoteJid, { text: summary });
}

module.exports = { handleMessage };
