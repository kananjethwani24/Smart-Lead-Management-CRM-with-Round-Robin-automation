import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { google } from 'googleapis';
import { assignLeadToCaller } from '@/lib/assignLead';
import crypto from 'crypto';

/**
 * POST /api/sync-leads (SQLite version)
 * Fetches leads from Google Sheets and syncs them to the database.
 * New leads are auto-assigned to sales callers via smart assignment logic.
 */
export async function POST() {
    try {
        const db = getDb();
        const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
        if (!key || key === '') {
            return NextResponse.json({ error: 'Google Sheet manual sync not configured.' }, { status: 400 });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(key),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:H',
        });

        const rows = response.data.values || [];
        if (rows.length <= 1) {
            return NextResponse.json({ message: 'No data found', synced: 0 });
        }

        const headers = rows[0].map(h => h.toLowerCase().trim());
        const dataRows = rows.slice(1);

        let synced = 0;
        let assigned = 0;

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const rowNumber = i + 2;

            const lead = {
                id: crypto.randomUUID(),
                name: row[headers.indexOf('name')] || '',
                phone: row[headers.indexOf('phone')] || '',
                timestamp: row[headers.indexOf('timestamp')] || null,
                lead_source: row[headers.indexOf('lead source')] || row[headers.indexOf('leadsource')] || row[headers.indexOf('lead_source')] || '',
                city: row[headers.indexOf('city')] || '',
                state: row[headers.indexOf('state')] || '',
                metadata: row[headers.indexOf('metadata')] || row[headers.indexOf('additional metadata')] || '',
                sheet_row_number: rowNumber,
            };

            if (lead.timestamp) {
                try {
                    lead.timestamp = new Date(lead.timestamp).toISOString();
                } catch {
                    lead.timestamp = new Date().toISOString();
                }
            } else {
                lead.timestamp = new Date().toISOString();
            }

            // SQLite UPSERT
            db.prepare(`
                INSERT INTO leads (id, name, phone, timestamp, lead_source, city, state, metadata, sheet_row_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(sheet_row_number) DO UPDATE SET
                    name = excluded.name,
                    phone = excluded.phone,
                    timestamp = excluded.timestamp,
                    lead_source = excluded.lead_source,
                    city = excluded.city,
                    state = excluded.state,
                    metadata = excluded.metadata
            `).run(lead.id, lead.name, lead.phone, lead.timestamp, lead.lead_source, lead.city, lead.state, lead.metadata, lead.sheet_row_number);

            const upserted = db.prepare('SELECT * FROM leads WHERE sheet_row_number = ?').get(lead.sheet_row_number);

            synced++;

            if (!upserted.assigned_caller_id) {
                const caller = await assignLeadToCaller(upserted);
                if (caller) assigned++;
            }
        }

        return NextResponse.json({
            message: `Synced ${synced} leads, assigned ${assigned} new leads`,
            synced,
            assigned,
        });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json(
            { error: 'Failed to sync leads: ' + error.message },
            { status: 500 }
        );
    }
}
