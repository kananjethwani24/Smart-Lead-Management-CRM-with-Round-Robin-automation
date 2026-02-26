import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

/**
 * DELETE /api/leads/[id] - Delete a lead
 */
export async function DELETE(request, { params }) {
    try {
        const db = getDb();
        const { id } = await params;

        const info = db.prepare('DELETE FROM leads WHERE id = ?').run(id);

        if (info.changes === 0) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
