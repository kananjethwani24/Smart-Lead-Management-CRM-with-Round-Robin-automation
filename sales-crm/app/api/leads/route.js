import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

/**
 * GET /api/leads - Fetch all leads with assigned caller info
 */
export async function GET() {
    try {
        const db = getDb();
        const rows = db.prepare(`
            SELECT 
                l.*, 
                c.id as caller_id, 
                c.name as caller_name, 
                c.role as caller_role
            FROM leads l
            LEFT JOIN callers c ON l.assigned_caller_id = c.id
            ORDER BY l.created_at DESC
        `).all();

        const data = rows.map(row => {
            const { caller_id, caller_name, caller_role, ...lead } = row;
            return {
                ...lead,
                caller: caller_id ? { id: caller_id, name: caller_name, role: caller_role } : null
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
