import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

/**
 * PUT /api/callers/[id] - Update a sales caller
 */
export async function PUT(request, { params }) {
    try {
        const db = getDb();
        const { id } = await params;
        const body = await request.json();
        const { name, role, languages, daily_lead_limit, assigned_states } = body;

        db.prepare(
            `UPDATE callers SET name = ?, role = ?, languages = ?, daily_lead_limit = ?, assigned_states = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(name, role, JSON.stringify(languages || []), daily_lead_limit, JSON.stringify(assigned_states || []), id);

        const row = db.prepare('SELECT * FROM callers WHERE id = ?').get(id);
        if (row) {
            row.languages = JSON.parse(row.languages || '[]');
            row.assigned_states = JSON.parse(row.assigned_states || '[]');
        }
        return NextResponse.json(row);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/callers/[id] - Delete a sales caller
 */
export async function DELETE(request, { params }) {
    try {
        const db = getDb();
        const { id } = await params;

        db.prepare('UPDATE leads SET assigned_caller_id = NULL WHERE assigned_caller_id = ?').run(id);
        db.prepare('DELETE FROM callers WHERE id = ?').run(id);

        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
