import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import crypto from 'crypto';

/**
 * GET /api/callers - Fetch all sales callers
 */
export async function GET() {
    try {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM callers ORDER BY created_at ASC').all();

        const data = rows.map(row => ({
            ...row,
            languages: JSON.parse(row.languages || '[]'),
            assigned_states: JSON.parse(row.assigned_states || '[]')
        }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/callers - Create a new sales caller
 */
export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { name, role, languages, daily_lead_limit, assigned_states } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const id = crypto.randomUUID();

        db.prepare(
            'INSERT INTO callers (id, name, role, languages, daily_lead_limit, assigned_states) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(id, name, role || '', JSON.stringify(languages || []), daily_lead_limit || 60, JSON.stringify(assigned_states || []));

        const row = db.prepare('SELECT * FROM callers WHERE id = ?').get(id);
        if (row) {
            row.languages = JSON.parse(row.languages || '[]');
            row.assigned_states = JSON.parse(row.assigned_states || '[]');
        }
        return NextResponse.json(row, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
