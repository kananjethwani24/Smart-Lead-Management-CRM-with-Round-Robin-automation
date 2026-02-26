import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

/**
 * GET /api/stats - Dashboard statistics (SQLite version)
 */
export async function GET() {
    try {
        const db = getDb();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
        const totalCallers = db.prepare('SELECT COUNT(*) as count FROM callers').get().count;
        const assignedLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE assigned_caller_id IS NOT NULL').get().count;
        const todayLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE created_at >= ?').get(todayISO).count;
        const unassignedLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE assigned_caller_id IS NULL').get().count;

        return NextResponse.json({
            totalLeads,
            totalCallers,
            assignedLeads,
            todayLeads,
            unassignedLeads,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
