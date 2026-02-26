import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { assignLeadToCaller } from '@/lib/assignLead';
import crypto from 'crypto';

/**
 * POST /api/webhook/new-lead (SQLite version)
 * Webhook endpoint for automation tools to push a new lead directly.
 */
/**
 * Safely parse a timestamp string (handles DD/MM/YYYY, ISO, and other formats).
 */
function parseTimestamp(value) {
    if (!value) return new Date().toISOString();
    try {
        // Handle DD/MM/YYYY HH:MM:SS format from Google Sheets
        const ddmmyyyy = String(value).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s*(.*)?$/);
        if (ddmmyyyy) {
            const [, day, month, year, time] = ddmmyyyy;
            const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time || '00:00:00'}`;
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) return d.toISOString();
        }
        // Try standard parsing
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.toISOString();
    } catch (e) { /* ignore */ }
    return new Date().toISOString();
}

export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { name, phone, timestamp, lead_source, city, state, metadata, sheet_row_number } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const lead = {
            id,
            name,
            phone: phone || '',
            timestamp: parseTimestamp(timestamp),
            lead_source: lead_source || '',
            city: city || '',
            state: state || '',
            metadata: metadata || '',
            sheet_row_number: sheet_row_number || null,
        };

        // Check for existing lead to prevent duplicates
        let existingLead = null;
        if (sheet_row_number) {
            existingLead = db.prepare('SELECT * FROM leads WHERE sheet_row_number = ?').get(sheet_row_number);
        } else {
            existingLead = db.prepare('SELECT * FROM leads WHERE name = ? AND phone = ?').get(lead.name, lead.phone);
        }

        if (existingLead) {
            // Update existing lead
            db.prepare(`
                UPDATE leads SET 
                    name = ?, phone = ?, timestamp = ?, lead_source = ?, 
                    city = ?, state = ?, metadata = ?
                WHERE id = ?
            `).run(lead.name, lead.phone, lead.timestamp, lead.lead_source, lead.city, lead.state, lead.metadata, existingLead.id);

            const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(existingLead.id);
            return NextResponse.json({
                message: 'Lead updated',
                lead: updated,
                assigned_to: updated.assigned_caller_id ? (db.prepare('SELECT name FROM callers WHERE id = ?').get(updated.assigned_caller_id)?.name || null) : null,
            }, { status: 200 });
        }

        // Insert new lead if no duplicate found
        db.prepare(`
            INSERT INTO leads (id, name, phone, timestamp, lead_source, city, state, metadata, sheet_row_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(lead.id, lead.name, lead.phone, lead.timestamp, lead.lead_source, lead.city, lead.state, lead.metadata, lead.sheet_row_number);

        const upserted = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id);

        let assignedCaller = null;
        if (!upserted.assigned_caller_id) {
            assignedCaller = await assignLeadToCaller(upserted);
        }

        return NextResponse.json({
            message: 'Lead added and assigned',
            lead: upserted,
            assigned_to: assignedCaller?.name || null,
        }, { status: 201 });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
