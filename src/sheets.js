const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

class SheetsManager {
    constructor() {
        this.doc = null;
    }

    async init() {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY
            ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim()
            : null;

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await this.doc.loadInfo();
        console.log(`Connected to Sheet: ${this.doc.title}`);
    }

    async ensureUserSheet(userId) {
        const sheetName = userId.split('@')[0];
        let sheet = this.doc.sheetsByTitle[sheetName];
        let isNew = false;

        if (!sheet) {
            console.log(`🆕 [${sheetName}] User baru terdeteksi! Membuat tab...`);
            sheet = await this.doc.addSheet({ title: sheetName });
            await sheet.setHeaderRow(['Tanggal', 'Kategori', 'Keterangan', 'Nominal']);
            isNew = true;
        }

        try {
            await sheet.loadHeaderRow();
        } catch (e) {
            await sheet.setHeaderRow(['Tanggal', 'Kategori', 'Keterangan', 'Nominal']);
        }

        return { sheet, isNew };
    }

    async addExpense(userId, category, description, amount) {
        const { sheet, isNew } = await this.ensureUserSheet(userId);
        const date = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        await sheet.addRow({
            'Tanggal': date,
            'Kategori': category,
            'Keterangan': description,
            'Nominal': amount
        });
        return { date, category, description, amount, isNew };
    }

    async getExpenses(userId) {
        const { sheet, isNew } = await this.ensureUserSheet(userId);
        const rows = await sheet.getRows();
        const data = rows.map(row => ({
            date: row.get('Tanggal'),
            category: row.get('Kategori'),
            description: row.get('Keterangan'),
            amount: parseInt(row.get('Nominal')) || 0
        }));
        return { data, isNew };
    }

    async getTotalExpense(userId) {
        const { data } = await this.getExpenses(userId);
        return data.reduce((sum, exp) => sum + exp.amount, 0);
    }

    async clearSheet(userId) {
        const { sheet } = await this.ensureUserSheet(userId);
        const rows = await sheet.getRows();
        for (const row of rows) {
            await row.delete();
        }
    }
}

module.exports = new SheetsManager();
