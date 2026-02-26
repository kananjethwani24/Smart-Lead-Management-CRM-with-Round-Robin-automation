import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
    try {
        const db = getDb();
        const data = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5').all();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const db = getDb();
        const { content } = await req.json();
        const id = crypto.randomUUID();
        db.prepare('INSERT INTO announcements (id, content) VALUES (?, ?)').run(id, content);
        const row = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
        return NextResponse.json(row);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
